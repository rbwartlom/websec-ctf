# React + Express TypeScript Notes Service

## Some Notes on Structure (Hint)
The frontend is just for show, and was made genuninely entirely by Claude 4.5 Opus, quite impressive in my opinion. It is just a presentation layer for the backend.
The backend generates swagger api docs into /dist and the frontend reads them to generate types for it's api clients. This is also not relevant for the exploit.
A swagger UI for docs is available at /api/docs and /api/docs.json.


## Getting started
Navigate to the backend and frontend directories and follow setup instructions.
Note: when running with `npm run dev`, the backend and frontend are configured so they automatically rebuild and restart when files are changed.

Idea:
- The backend generates swagger api docs, exports them to its parent directory (/dist), and the frontend reads them to generate types for the api calls.
- The frontend builds into the parent directory (same directory as the backend's parent directory) so that the backend can serve the frontend.


## Docker

First, create a `flag.key` file in the root directory.
To build the docker image, run:
```
docker build -t <tag> --build-arg BASE_URL=http://localhost:<your-port> .
```
or if deploying on a remote url:
```
docker build -t <tag> --build-arg BASE_URL=<your-base-url> .
```
(the BASE_URL arg is used for swagger docs, but the frontend will work without it)

To run the docker image, run:
```
docker run -p <your-port>:3000  <tag>
```
