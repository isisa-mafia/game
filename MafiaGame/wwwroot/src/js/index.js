import React from "react";
import ReactDOM from "react-dom";
import App from "./App"
import 'bootstrap/dist/css/bootstrap.min.css'
import '../css/'

var app = document.getElementById("app");

ReactDOM.render(
    <App />,
    app
);
if (process.env.NODE_ENV !== 'production')
    module.hot.accept();