import dotenv from "dotenv";
import { DEFAULTS } from "./config.js";
import app from "./app.js";

dotenv.config();

app.listen(DEFAULTS.PORT, () => {
  console.log("Server is running on port " + DEFAULTS.PORT);
});
