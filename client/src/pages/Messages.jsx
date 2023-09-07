import React, { useState, useEffect, useContext, useRef } from "react";
import UserContext from "../contexts/UserContext";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  Container,
} from "@mui/material";
import {
  AttachFile,
  Send,
  Cancel,
  ArrowDropDown,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AspectRatio from "@mui/joy/AspectRatio";


function Messages() {
  const navigate = useNavigate();
  const [carList, setCarList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [messageId, setMessageId] = useState(0);
  const [height, setHeight] = useState("60vh");
  const [imageFile, setImageFile] = useState(null);
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [open2, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({
    text: "",
  });
  var createdata = true;
  var chatDetails
  const ref = useRef(null);
  const [ws, setWs] = useState(null);

  function updateMessage() {
    http.get(`/message/${messageId}`).then((res) => {
      setMessage(res.data);
      setImageFile(res.data.imageFile);
      if (res.data.imageFile) {
        setHeight("45vh");
      }
    });
  }

  const handledropdownevent = (messageid) => {
    setMessageId(messageid);
  };

  const handleOpen2 = () => {
    setOpen(true);
  };

  const handleClose2 = () => {
    setOpen(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickClose = () => {
    setEditing(true);
    setHeight("45vh");
    setAnchorEl(null);
    updateMessage();
  };

  const handleClickClose2 = () => {
    setAnchorEl(null);
    handleOpen2();
  };

  const deleteMessage = () => {
    http.delete(`/message/${messageId}`).then(() => {
      getMessages();
      getMessages();
      getMessages();
      getMessages();
      getMessages();
      handleClose2();
    });
    deleteMessageReal(messageId);
    setMessageId(0)
  };

  var color = "#9FEDD7";

  const scrolltobottom = () => {
    const lastChildElement = ref.current?.lastElementChild;
    lastChildElement?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    http.get("/car").then((res) => {
      setCarList(res.data);
    });
    http.get("/chat").then((res) => {
      setChatList(res.data);
    });
    http.get("/user").then((res) => {
      setUserList(res.data);
    });
    http.get("/message").then((res) => {
      setMessageList(res.data);
    });
    setTimeout(scrolltobottom, 200);
  }, [user]);

  const handleReceivedMessage = (receivedBlob) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
          try {
             if (data.split(",")[0] == "edit") {
              const receivedObject = JSON.parse(data.split(";")[1]);
              setMessageList((messageList) => {
                const updatedData = messageList.map((item) =>
                  item.id === receivedObject.id ? receivedObject: item
                );
                return updatedData;
              });
            } else if (data.split(",")[0] == "delete") {
              setMessageList((messageList) => messageList.filter((item) => item.id !== Number(data.split(",")[1])));
            } else {
              const receivedObject = JSON.parse(data);
              setMessageList((messageList) => [...messageList, receivedObject])
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
    };

    // Read the Blob data as text
    reader.readAsText(receivedBlob);
  };

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost:8080');
    newWs.onmessage = (event) => {
      const receivedData = event.data
      if (receivedData instanceof Blob) {
        handleReceivedMessage(receivedData)
        setTimeout(scrolltobottom, 50);
      }
    };
    setWs(newWs);
    return () => {
      newWs.close();
    };
  }, []);

  const sendMessage = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  const editMessage = (data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(["edit", ";" + JSON.stringify(data)]);
    }
  };

  const deleteMessageReal = (messageId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(["delete",messageId]);
    }
  };

  const getMessages = () => {
    http.get("/message").then((res) => {
      setMessageList(res.data);
    });
  };

  const formik = useFormik({
    initialValues: message,
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      title: yup
        .string()
        .trim()
        .min(1, "Text must be at least 1 characters")
        .max(250, "Text  must be at most 250 characters"),
    }),
    onSubmit: (data) => {
      for (var j in messageList) {
        if (messageId == messageList[j].id) {
          if (imageFile) {
            data.imageFile = imageFile;
            data.text = data.text.trim();
            http.put(`/message/${messageId}`, data).then((res) => {
              data.text = "";
              setHeight("60vh");
              setEditing(false)
              getMessages();
              setImageFile(null);
            });
            setMessageId(0)
            setMessage({ text: "" })
            createdata = false;
            data.chatId = id
            data.userId = user.id
            data.edited = true
            editMessage(data)
          } else {
            if (data.text.trim().length < 1) {
              toast.error("Type something or upload image");
            } else {
              data.imageFile = null;
              data.text = data.text.trim();
              http.put(`/message/${messageId}`, data).then((res) => {
                data.text = "";
                setHeight("60vh");
                setEditing(false)
                getMessages();
                getMessages();
                getMessages();
              });
              setMessageId(0)
              setMessage({ text: "" })
              createdata = false;
              data.chatId = id
              data.userId = user.id
              data.edited = true
              editMessage(data)
            }
          }
        }
      }
      if (createdata) {
        for(var j in chatList){
          if (chatList[j].id == id){
            chatDetails = chatList[j]
          }
        }
        if (imageFile) {
          data.imageFile = imageFile;
          data.text = data.text;
          console.log(data);
          http.post(`/message/${id}`, data).then((res) => {
            data.text = "";
            setHeight("60vh");
            getMessages();
            setImageFile(null);
          });
          data.chatId = id
          data.userId = user.id
          data.edited = false
          sendMessage(data);
          chatDetails.delete = false
          chatDetails.userDelete1 = null
          chatDetails.userDelete2 = null
          http.put(`/chat/${id}`, chatDetails);
        } else {
          if (data.text.trim().length < 1) {
            toast.error("Type something or upload image");
          } else {
            data.imageFile = null;
            data.text = data.text;
            http.post(`/message/${id}`, data).then((res) => {
              data.text = "";
              getMessages();
            });
            data.chatId = id
            data.userId = user.id
            data.edited = false
            sendMessage(data);
            chatDetails.delete = false
            chatDetails.userDelete1 = null
            chatDetails.userDelete2 = null
            http.put(`/chat/${id}`, chatDetails);
          }
        }
        setTimeout(scrolltobottom, 100);
      }
      createdata = true;
    },
  });

  const onFileChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Maximum file size is 1MB");
        return;
      }
      let formData = new FormData();
      formData.append("file", file);
      http
        .post("/file/chatupload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImageFile(res.data.filename);
          setHeight("45vh");
        })
        .catch(function (error) {
          console.log(error.response);
        });
    }
  };

  return (
    <Container>
      <Box>
        {chatList.map((chat, i) => {
          return (
            <Box>
              {chat.id == id && (
                <Box>
                  {carList.map((car, i) => {
                    return (
                      <Box>
                        {chat.carId == car.id && (
                          <Box>
                            {user &&
                              (user.id == chat.userId ||
                                user.id == car.userId) && (
                                <Box
                                  sx={{
                                    width: "100%",
                                    left: 0,
                                    position: "fixed",
                                  }}
                                >
                                  <Box
                                    sx={{ backgroundColor: color, padding: 2 }}
                                  >
                                    <Box sx={{ display: "flex" }}>
                                      <Box sx={{ display: "flex" }}>
                                        <AspectRatio
                                          sx={{ maxWidth: 200, minWidth: 100 }}
                                        >
                                          <Box
                                            component="img"
                                            src={`${import.meta.env.VITE_FILE_BASE_URL
                                              }${car.imageFile}`}
                                            alt="Car Image"
                                          ></Box>
                                        </AspectRatio>
                                      </Box>
                                      <Box sx={{ ml: 2, mt: 2, display: "flex" }}>
                                        <Box>
                                          <Typography
                                            sx={{
                                              ml: 2,
                                              fontWeight: "bold",
                                              color: "black",
                                            }}
                                          >
                                            {car.carmodel}
                                          </Typography>
                                        </Box>
                                        <Box></Box>
                                      </Box>
                                      <Box sx={{ flexGrow: 0.89 }} />
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          color: "black",
                                        }}
                                      >
                                        <Box sx={{ display: "flex" }}>
                                          {user && user.id == chat.userId && (
                                            <Box>
                                              {userList.map((ouser, i) => {
                                                return (
                                                  <Box>
                                                    {car.userId == ouser.id && (
                                                      <Link
                                                        to={`/allreviews/${ouser.id}/0`}
                                                      >
                                                        <Box
                                                          sx={{
                                                            display: "flex",
                                                          }}
                                                        >
                                                          <Avatar
                                                            sx={{
                                                              mr: 1,
                                                              color: "white",
                                                            }}
                                                            alt={ouser.username}
                                                            src={`${import.meta.env
                                                              .VITE_FILE_BASE_URL
                                                              }${ouser.imageFile
                                                              }`}
                                                          />
                                                          <Typography
                                                            sx={{ mt: 1 }}
                                                            color="text.secondary"
                                                          >
                                                            {ouser.username}
                                                          </Typography>
                                                        </Box>
                                                      </Link>
                                                    )}
                                                  </Box>
                                                );
                                              })}
                                            </Box>
                                          )}
                                          {user && user.id != chat.userId && (
                                            <Box>
                                              {userList.map((ouser, i) => {
                                                return (
                                                  <Box>
                                                    {chat.userId ==
                                                      ouser.id && (
                                                        <Link
                                                          to={`/allreviews/${ouser.id}/0`}
                                                        >
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                            }}
                                                          >
                                                            <Avatar
                                                              sx={{
                                                                mr: 1,
                                                                color: "white",
                                                              }}
                                                              alt={ouser.username}
                                                              src={`${import.meta.env
                                                                .VITE_FILE_BASE_URL
                                                                }${ouser.imageFile
                                                                }`}
                                                            />
                                                            <Typography
                                                              sx={{ mt: 1 }}
                                                            >
                                                              {ouser.username}
                                                            </Typography>
                                                          </Box>
                                                        </Link>
                                                      )}
                                                  </Box>
                                                );
                                              })}
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      minHeight: "47vh",
                                      height: height,
                                      maxHeight: "60vh",
                                      mt: 1,
                                      mb: 1,
                                      overflow: "auto",
                                    }}
                                  >
                                    {messageList.map((message, i) => {
                                      return (
                                        <Box>
                                          <div ref={ref}>
                                            {message.chatId == id && (
                                              <Box sx={{ display: "flex" }}>
                                                {message.userId != user.id && (
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "flex-end",
                                                      px: 2,
                                                    }}
                                                  >
                                                    {message.imageFile && (
                                                      <Box
                                                        sx={{
                                                          justifyContent:
                                                            "space-between",
                                                          backgroundColor:
                                                            "#A9A9A9",
                                                          pt: 1,
                                                          pb: 1,
                                                          mb: 2,
                                                          borderRadius: 4,
                                                        }}
                                                      >
                                                        <AspectRatio
                                                          sx={{
                                                            maxWidth: 200,
                                                            minWidth: 200,
                                                            px: 2,
                                                            py: 1,
                                                          }}
                                                        >
                                                          <Box
                                                            component="img"
                                                            src={`${import.meta.env
                                                              .VITE_CHAT_FILE_URL
                                                              }${message.imageFile
                                                              }`}
                                                            alt="Car Image"
                                                          ></Box>
                                                        </AspectRatio>
                                                        <Box sx={{ display: "flex" }}>
                                                          {message.text != "" && (
                                                            <Box >
                                                              <Box sx={{ pl: 2 }}>
                                                                <Typography
                                                                  sx={{
                                                                    wordWrap:
                                                                      "break-word",
                                                                    p: 1,
                                                                    maxWidth: 600,
                                                                    color: "black",
                                                                  }}
                                                                >
                                                                  {message.text}
                                                                </Typography>
                                                              </Box>
                                                            </Box>
                                                          )}

                                                          <Box sx={{ flexGrow: 0.96 }} />
                                                          <Box>
                                                            {message.edited && (
                                                              <Typography
                                                                sx={{
                                                                  color: "#424242",
                                                                  fontSize: "12px",
                                                                  mt: 2
                                                                }}
                                                              >
                                                                edited
                                                              </Typography>
                                                            )}
                                                          </Box>
                                                        </Box>
                                                      </Box>
                                                    )}
                                                    {!message.imageFile && (
                                                      <Box
                                                        sx={{
                                                          display: "flex",
                                                          justifyContent:
                                                            "flex-end",
                                                          borderRadius: 4,
                                                          bgcolor: "#A9A9A9",
                                                          mb: 2,
                                                        }}
                                                      >
                                                        <Box>
                                                          <Typography
                                                            sx={{
                                                              wordWrap:
                                                                "break-word",
                                                              maxWidth: 600,
                                                              color: "black",
                                                              p: 1
                                                            }}
                                                          >
                                                            {message.text}
                                                          </Typography>
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }} />
                                                        <Box>
                                                          {message.edited && (
                                                            <Typography
                                                              sx={{
                                                                color: "#424242",
                                                                fontSize: "12px",
                                                                mt: 2,
                                                                mr: 1
                                                              }}
                                                            >
                                                              edited
                                                            </Typography>
                                                          )}
                                                        </Box>
                                                      </Box>
                                                    )}
                                                  </Box>
                                                )}
                                                {message.userId == user.id && (
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "flex-end",
                                                      width: "100vw",
                                                      px: 2,
                                                    }}
                                                  >
                                                    {message.imageFile && (
                                                      <Box
                                                        sx={{
                                                          justifyContent:
                                                            "space-between",
                                                          backgroundColor:
                                                            "#4169E1",
                                                          pt: 1,
                                                          pb: 1,
                                                          mb: 2,
                                                          borderRadius: 4,
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{ display: "flex" }}
                                                        >
                                                          <AspectRatio
                                                            sx={{
                                                              maxWidth: 200,
                                                              minWidth: 200,
                                                              px: 2,
                                                              py: 1,
                                                            }}
                                                          >
                                                            <Box
                                                              component="img"
                                                              src={`${import.meta.env
                                                                .VITE_CHAT_FILE_URL
                                                                }${message.imageFile
                                                                }`}
                                                              alt="Car Image"
                                                            ></Box>
                                                          </AspectRatio>
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                            }}
                                                            onClick={() =>
                                                              handledropdownevent(
                                                                message.id
                                                              )
                                                            }
                                                          >
                                                            <IconButton
                                                              onClick={
                                                                handleClick
                                                              }
                                                            >
                                                              <ArrowDropDown
                                                                sx={{
                                                                  color: "white",
                                                                }}
                                                              />
                                                            </IconButton>
                                                          </Box>
                                                        </Box>
                                                        <Box sx={{ pl: 2, display: "flex" }}>
                                                          <Box>
                                                            {message.text != "" && (
                                                              <Box>
                                                                <Typography
                                                                  sx={{
                                                                    wordWrap:
                                                                      "break-word",
                                                                    p: 1,
                                                                    maxWidth: 600,
                                                                    color: "white",
                                                                  }}
                                                                >
                                                                  {message.text}
                                                                </Typography>
                                                              </Box>
                                                            )}
                                                          </Box>
                                                          <Box
                                                            sx={{ flexGrow: 0.94 }}
                                                          />
                                                          <Box sx={{ display: "flex" }}>
                                                            {message.edited && (
                                                              <Typography
                                                                sx={{
                                                                  color: "#9fa8da",
                                                                  mt: 2,
                                                                  fontSize: "12px"
                                                                }}
                                                              >
                                                                edited
                                                              </Typography>
                                                            )}
                                                          </Box>
                                                        </Box>
                                                      </Box>
                                                    )}
                                                    {!message.imageFile && (
                                                      <Box>
                                                        <Box
                                                          sx={{
                                                            color: "white",
                                                            backgroundColor:
                                                              "#4169E1",
                                                            maxWidth: "100vw",
                                                            mb: 2,
                                                            display: "flex",
                                                            borderRadius: 4,
                                                          }}
                                                        >
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                            }}
                                                          >
                                                            <Typography
                                                              sx={{
                                                                wordWrap:
                                                                  "break-word",
                                                                maxWidth: 600,
                                                                p: 1
                                                              }}
                                                            >
                                                              {message.text}
                                                            </Typography>
                                                          </Box>
                                                          <Box
                                                            sx={{ flexGrow: 1 }}
                                                          />
                                                          <Box sx={{ display: "flex" }}>
                                                            {message.edited && (
                                                              <Typography
                                                                sx={{
                                                                  color: "#9fa8da",
                                                                  mt: 2,
                                                                  fontSize: "12px"
                                                                }}
                                                              >
                                                                edited
                                                              </Typography>
                                                            )}
                                                          </Box>
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                            }}
                                                            onClick={() =>
                                                              handledropdownevent(
                                                                message.id
                                                              )
                                                            }
                                                          >
                                                            <IconButton
                                                              onClick={
                                                                handleClick
                                                              }
                                                            >
                                                              <ArrowDropDown
                                                                sx={{
                                                                  color: "white",
                                                                }}
                                                              />
                                                            </IconButton>
                                                          </Box>
                                                        </Box>
                                                      </Box>
                                                    )}
                                                  </Box>
                                                )}
                                              </Box>
                                            )}
                                          </div>
                                        </Box>
                                      );
                                    })}
                                  </Box>

                                  <Box>
                                    <Box sx={{ display: "flex" }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          minWidth: "10%",
                                        }}
                                      ></Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          minWidth: "80%",
                                        }}
                                      >
                                        {imageFile && !editing && (
                                          <Box>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                width: "80vw",
                                                backgroundColor: "#9FEDD7",
                                                borderRadius:
                                                  "15px 15px 0px 0px",
                                              }}
                                            >
                                              <Box sx={{ display: "flex" }}>
                                                <AspectRatio
                                                  sx={{
                                                    mt: 1,
                                                    mb: 1,
                                                    ml: 1,
                                                    width: 100,
                                                  }}
                                                >
                                                  <Box
                                                    component="img"
                                                    alt="tutorial"
                                                    src={`${import.meta.env
                                                      .VITE_CHAT_FILE_URL
                                                      }${imageFile}`}
                                                  ></Box>
                                                </AspectRatio>
                                              </Box>
                                              <Box
                                                sx={{ display: "flex", mt: 3, ml: 2 }}
                                              >
                                                <Typography
                                                  sx={{ color: "black" }}
                                                >
                                                  Attachment
                                                </Typography>
                                              </Box>
                                              <Box sx={{ flexGrow: 1 }} />
                                              <Box sx={{ display: "flex" }}>
                                                <IconButton
                                                  onClick={() => [
                                                    setImageFile(null),
                                                    setHeight("60vh"),
                                                  ]}
                                                >
                                                  <Cancel />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                            <Box sx={{ mr: 2, ml: 2 }} />
                                          </Box>
                                        )}
                                        {imageFile && editing && (
                                          <Box>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                width: "80vw",
                                                backgroundColor: "#9FEDD7",
                                                borderRadius:
                                                  "15px 15px 0px 0px",
                                              }}
                                            >
                                              <Box sx={{ display: "flex" }}>
                                                <AspectRatio
                                                  sx={{
                                                    mt: 1,
                                                    mb: 1,
                                                    ml: 1,
                                                    width: 100,
                                                  }}
                                                >
                                                  <Box
                                                    component="img"
                                                    alt="tutorial"
                                                    src={`${import.meta.env
                                                      .VITE_CHAT_FILE_URL
                                                      }${imageFile}`}
                                                  ></Box>
                                                </AspectRatio>
                                              </Box>
                                              <Box
                                                sx={{ display: "flex", mt: 3, ml: 2 }}
                                              >
                                                <Typography
                                                  sx={{ color: "black" }}
                                                >
                                                  Attachment
                                                </Typography>
                                              </Box>
                                              <Box sx={{ display: "flex" }}>
                                                <IconButton
                                                  onClick={() =>
                                                    setImageFile(null)
                                                  }
                                                >
                                                  <Cancel />
                                                </IconButton>
                                              </Box>
                                              <Box sx={{ flexGrow: 1 }} />
                                              <Box
                                                sx={{ display: "flex", mt: 3, ml: 2 }}
                                              >
                                                <Typography
                                                  sx={{ color: "black" }}
                                                >
                                                  Currently In Edit Mode
                                                </Typography>
                                              </Box>
                                              <Box sx={{ display: "flex" }}>
                                                <IconButton
                                                  onClick={() => [
                                                    setMessageId(0),
                                                    setImageFile(null),
                                                    setHeight("60vh"),
                                                    setEditing(false),
                                                    setMessage({
                                                      text: "",
                                                    })
                                                  ]}
                                                >
                                                  <Cancel />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                            <Box sx={{ mr: 2, ml: 2 }} />
                                          </Box>
                                        )}
                                        {!imageFile && editing && (
                                          <Box>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                width: "80vw",
                                                backgroundColor: "#9FEDD7",
                                                borderRadius:
                                                  "15px 15px 0px 0px",
                                                height: 72
                                              }}
                                            >
                                              <Box
                                                sx={{ display: "flex", mt: 3, ml: 2 }}
                                              >
                                                <Typography
                                                  sx={{ color: "black" }}
                                                >
                                                  Currently In Edit Mode
                                                </Typography>
                                              </Box>
                                              <Box sx={{ flexGrow: 1 }} />
                                              <Box sx={{ display: "flex" }}>
                                                <IconButton
                                                  onClick={() => [
                                                    setMessageId(0),
                                                    setHeight("60vh"),
                                                    setEditing(false),
                                                    setMessage({
                                                      text: "",
                                                    })
                                                  ]}
                                                >
                                                  <Cancel />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                            <Box sx={{ mr: 2, ml: 2 }} />
                                          </Box>
                                        )}
                                      </Box>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          minWidth: "10%",
                                        }}
                                      ></Box>
                                    </Box>
                                    <Box
                                      component="form"
                                      onSubmit={formik.handleSubmit}
                                      sx={{ display: "flex" }}
                                    >
                                      <Box sx={{ mt: 1, ml: 2, mr: 2 }}>
                                        <IconButton
                                          variant="contained"
                                          component="label"
                                        >
                                          <AttachFile />
                                          <input
                                            hidden
                                            accept="image/*"
                                            multiple
                                            type="file"
                                            onChange={onFileChange}
                                            onClick={(event) => {
                                              event.target.value = null;
                                            }}
                                          />
                                        </IconButton>
                                      </Box>
                                      <Box sx={{ width: "100%" }}>
                                        <TextField
                                          fullWidth
                                          autoComplete="off"
                                          maxRows={1}
                                          name="text"
                                          value={formik.values.text}
                                          onChange={formik.handleChange}
                                          error={
                                            formik.touched.text &&
                                            Boolean(formik.errors.text)
                                          }
                                          helperText={
                                            formik.touched.text &&
                                            formik.errors.text
                                          }
                                        />
                                      </Box>
                                      <Box sx={{ mt: 1, ml: 2, mr: 2 }}>
                                        <IconButton
                                          variant="contained"
                                          type="submit"
                                        >
                                          <Send />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            {user &&
                              user.id != chat.userId &&
                              user.id != car.userId && (
                                <Box>{navigate(`/marketplace`)}</Box>
                              )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleClickClose} sx={{ color: "#016670" }}>
            Edit
          </MenuItem>
          <MenuItem onClick={handleClickClose2} sx={{ color: "#DD4052" }}>
            Delete
          </MenuItem>
        </Menu>
        <ToastContainer />
        <Dialog open={open2} onClose={handleClose2}>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this message?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleClose2}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={deleteMessage}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Messages;
