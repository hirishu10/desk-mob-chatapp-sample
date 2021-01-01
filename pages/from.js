import Head from 'next/head'
import Image from 'next/image'
import React from 'react'

function from() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        //   fontSize: "50px",
        // paddingTop: "50px",
        backgroundColor: "#efe8ff",
        color: "#3c3c3c",
      }}
    >
      <Head>
        <title>Rishu Chowdhary</title>
        <meta name="Rishu Chowdhary" content="Software Developer" />
        <link rel="icon" href="/rishufavicon.ico" />
      </Head>
      <div style={{
        width: '100%',
        height: "50%",
        // backgroundColor:"red",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}>
        <Image src={"/footerLogo/from.svg"} alt={"Rishu Chowdhary"} width={"300px"} height={"300px"} priority={true} />
      </div>
      {/*  */}
      <div style={{
        width: '100%',
        height: "5%",
        // backgroundColor:"green",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        {`Designed & Developed`}
      </div>
      {/*  */}
      <div style={{
        width: '100%',
        height: "5%",
        // backgroundColor:"blue",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}>
        From
      </div>
      {/*  */}
      <div style={{
        width: '100%',
        height: "5%",
        // backgroundColor:"purple",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}>
        Rishu Chowdhary
      </div>
      {/*  */}
      <div style={{
        width: '100%',
        height: "5%",
        // backgroundColor:"orange",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 5,
      }}>
        <span style={{
          paddingRight: 5,
        }}>{`Github - `}</span>
        <span>
          <a
            href="https://github.com/hirishu10"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              // color: "blue",
            }}>https://github.com/hirishu10</a>
        </span>
      </div>
      {/*  */}
      <div style={{
        width: '100%',
        height: "15%",
        // backgroundColor:"lime",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <span>Desk-Mob-ChatApp</span>
        <span>
          <a
            href="https://github.com/hirishu10/desk-mob-chatapp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              // color: "blue",
              fontSize: 14,
            }}>https://github.com/hirishu10/desk-mob-chatapp</a>
        </span>
      </div>
    </div>
  )
}

export default from