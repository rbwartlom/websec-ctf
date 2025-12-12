# React + Express TypeScript Starter

## Getting started
Navigate to the backend and frontend directories and follow setup instructions.
Note: when running with `npm run dev`, the backend and frontend are configured so they automatically rebuild and restart when files are changed.


Idea:
- The backend generates swagger api docs, exports them to its parent directory (/dist), and the frontend reads them to generate types for the api calls.
- The frontend builds into the parent directory (same directory as the backend's parent directory) so that the backend can serve the frontend.
