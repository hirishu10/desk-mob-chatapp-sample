import Head from "next/head";
import React from "react";
import style from "../styles/Components/ChatScreen.module.scss";
import Splash from "./splash";

function Test() {
  //
  return (
    <div className={style.container}>
      <Head>
        <title>Test</title>
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <Splash />
    </div>
  );
}

export default Test;
