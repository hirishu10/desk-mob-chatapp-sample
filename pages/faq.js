import React from "react";
import Head from "next/head";

function faq() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontSize: "50px",
        paddingTop: "50px",
        backgroundColor: "#efe8ff",
        color: "#3c3c3c",
      }}
    >
      <Head>
        <title>FAQ?</title>
        <meta name="FAQ?" content="Frequently Asked Question?" />
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      We are Working 🛠
    </div>
  );
}

export default faq;
