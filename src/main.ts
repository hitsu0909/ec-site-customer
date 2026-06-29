import { createApp } from "vue";
// import './style.css'
import App from "./App.vue";
import router from "./router";

import "./assets/default.css";
import "./assets/index.css";
import "./assets/style.css";

import "./assets/base.css";
import "./assets/layout.css";

createApp(App).use(router).mount("#app");
