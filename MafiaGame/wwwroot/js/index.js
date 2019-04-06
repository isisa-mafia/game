import React from "react";
import ReactDOM from "react-dom";
import App from "./App"
import 'bootstrap/dist/css/bootstrap.min.css'

var app = document.getElementById("app");

ReactDOM.render(
    <App />,
    app
);
// module.hot.accept();