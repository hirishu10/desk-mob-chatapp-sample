import React from "react";
import { Avatar } from "@mui/material";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function EachMessages({ message, photoURL, uniqueKey, id, timesTamp }) {
  const [user, loading] = useAuthState(auth);

  return id === user?.email ? (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        marginBottom: 10,
        borderRadius: 10,
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          textAlign: "end",
        }}
      >
        <p
          key={uniqueKey}
          style={{
            backgroundColor: "#039600",
            color: "white",
            borderRadius: 10,
            padding: 5,
            minHeight: 30,
            textAlign: "start",
            minWidth: 50,
            maxWidth: 350,
            fontSize: 14,
            marginBottom: -5,
          }}
        >
          {message}
        </p>
        <span
          style={{
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 4,
            marginBottom: -4,
            textAlign: "end",
          }}
          // >{`12 Mar 12:24PM (Saturday)`}</span>//::> Debug
        >
          {timesTamp}
        </span>
      </div>
      <Avatar
        sx={{ width: 25, height: 25 }}
        src={photoURL}
        style={{
          marginLeft: 5,
        }}
      />
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        marginBottom: 10,
        borderRadius: 10,
        justifyContent: "flex-start",
      }}
    >
      <Avatar
        sx={{ width: 25, height: 25 }}
        src={photoURL}
        style={{
          marginRight: 5,
        }}
      />
      <div
        style={{
          textAlign: "start",
        }}
      >
        <p
          key={uniqueKey}
          style={{
            // backgroundColor: "#cc0808",
            backgroundColor: "#ff5e00",
            color: "white",
            borderRadius: 10,
            padding: 5,
            minHeight: 30,
            textAlign: "start",
            minWidth: 50,
            maxWidth: 350,
            fontSize: 14,
            marginBottom: -5,
          }}
        >
          {message}
        </p>
        <span
          style={{
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 4,
            marginBottom: -4,
            textAlign: "start",
          }}
          // >{`12 Mar 12:24PM (Saturday)`}</span>//::> Debug
        >
          {timesTamp}
        </span>
      </div>
    </div>
  );
}

export default EachMessages;
