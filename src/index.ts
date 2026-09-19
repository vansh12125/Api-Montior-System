import "./config/dotenv.config";
import app from "./app";
import config from "./shared/constants";

const PORT: number = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
