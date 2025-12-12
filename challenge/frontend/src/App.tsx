import { useState } from "react";
// import build from "./build";
if (process.env.NODE_ENV === "development") {
  //in production, this step should be executed once on build
  // build();
}
import { client, getApiExample, GetApiExampleResponse } from "./services/api-service";
import { getAuthHeader } from "./services/auth-service";
import toast, { Toaster } from "react-hot-toast";

client.setConfig({
  baseURL: "http://localhost:3000",
})

client.instance.interceptors.request.use((config) => {
  const header = getAuthHeader();
  if(header !== null) config.headers.set('Authorization', header);
  return config;
})

function App() {
  const [example, setExample] = useState<GetApiExampleResponse | null>(null);

  const onGetExample = async () => {
    try {
      const response = await getApiExample();
      console.log(response.data);
      if(response.data !== undefined) setExample(response.data);
      else throw new Error("No data in response");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching example");
    }
  }

  return (
    <>
      <div>test</div>
      <button onClick={onGetExample}>Get Example</button>
      {example !== null && <div>{example.message}</div>}
      <Toaster 
        position="bottom-left"
        toastOptions={{
          style: {
            background: "white",
            color: "black",
          },
        }}
      />
    </>
  );
}

export default App;
