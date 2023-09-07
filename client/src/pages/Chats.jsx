import React, { useEffect, useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Button,
  Avatar,
  Container,
} from "@mui/material";
import { Search, Clear, ArrowDropDownTwoTone, PushPin } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import http from "../http";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AspectRatio from "@mui/joy/AspectRatio";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const usertheme = createTheme({
  palette: {
    primary: {
      main: "#016670",
    },
    secondary: {
      main: "#0044ff",
    },
    input: {
      color: "#016670",
    },
  },
});

function Chats() {
  const [carList, setCarList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [search, setSearch] = useState("");
  const [chatId, setChatId] = useState("");
  const [chatDetails, setChatDetails] = useState("");
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleClickClose() {
    setAnchorEl(null);
    handleOpen2();
  }

  const [open2, setOpen] = useState(false);

  function handleOpen2() {
    setOpen(true);
  }

  function handleClose2() {
    setOpen(false);
  }

  const getChats = () => {
    http.get(`/chat`).then((res) => {
      setChatList(res.data);
    });
  };

  function deleteChat() {
    if(chatDetails.delete){
      if(chatDetails.userDelete1 != user.id){
        http.delete(`/chat/${chatId}`);
        handleClose2();
        getChats();
        getChats();
        getChats();
        getChats();
      }
    }else{
      chatDetails.delete = true
      chatDetails.userDelete1 = user.id
      http.put(`/chat/${chatId}`, chatDetails);
      handleClose2();
      getChats();
      getChats();
      getChats();
      getChats();
    }
  }

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const searchChats = () => {
    http.get(`/chat?search=${search}`).then((res) => {
      setChatList(res.data);
    });
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchChats();
    }
  };
  const onClickSearch = () => {
    searchChats();
  };
  const onClickClear = () => {
    setSearch("");
    getChats();
  };

  const onClickPin = () => {
    if (chatDetails.userPinned1 && chatDetails.userPinned1 != user.id) {
      chatDetails.userPinned2 = user.id
    } else {
      chatDetails.userPinned1 = user.id
    }
    chatDetails.pinned = true
    console.log(chatDetails)
    http.put(`/chat/${chatId}`, chatDetails);
    handleClose();
    getChats();
    getChats();
    getChats();
    getChats();
  }

  const onClickUnpin = () => {
    if (chatDetails.pinned) {
      if (chatDetails.userPinned1 && chatDetails.userPinned2) {
        if (user.id == chatDetails.userPinned1) {
          chatDetails.userPinned1 = null
        } else {
          chatDetails.userPinned2 = null
        }
      } else {
        if (user.id == chatDetails.userPinned1) {
          chatDetails.userPinned1 = null
        } else {
          chatDetails.userPinned2 = null
        }
        chatDetails.pinned = false
      }
    }
    console.log(chatDetails)
    http.put(`/chat/${chatId}`, chatDetails);
    handleClose();
    getChats();
    getChats();
    getChats();
    getChats();
  };

  useEffect(() => {
    http.get(`/chat`).then((res) => {
      setChatList(res.data);
    });
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
    http.get(`/message`).then((res) => {
      setMessageList(res.data);
    });
    http.get(`/user`).then((res) => {
      setUserList(res.data);
    });
  }, []);
  return (
    <Container>
      <Box>
        <Box sx={{ display: "flex", mt: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ color: "#016670" }}>
              All Chats
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ThemeProvider theme={usertheme}>
              <TextField
                hiddenLabel
                value={search}
                placeholder="Search"
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
                variant="filled"
                size="small"
              ></TextField>
              <IconButton color="primary" onClick={onClickSearch}>
                <Search />
              </IconButton>
              <IconButton color="primary" onClick={onClickClear}>
                <Clear />
              </IconButton>
            </ThemeProvider>

            <Box />
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: "black" }} />
        {chatList.map((chat, i) => {
          return (
            <Box>
              {carList.map((car, i) => {
                return (
                  <Box>
                    {car.id == chat.carId && (
                      <Box>
                        {user &&
                          (user.id == chat.userId || user.id == car.userId) && (!chat.delete || (chat.delete && (user.id != chat.userDelete1 && user.id != chat.userDelete2 ))) && (
                            <Box>
                              <Box>
                                {chat.pinned && (user.id == chat.userPinned1 || user.id == chat.userPinned2) && (
                                  <Link to={`/messages/${chat.id}`}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        mt: 2,
                                        mb: 2,
                                      }}
                                    >
                                      <Box>
                                        <Box sx={{ display: "flex" }}>
                                          <PushPin sx={{ color: "black", fontSize: "large", mt: 1, color: "#616161" }} />
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              color: "#016670",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {chat.car.carmodel}
                                          </Typography>
                                          <Link>
                                            <div onClick={() => setChatDetails(chat)}>
                                              <IconButton
                                                id="basic-button"
                                                aria-controls={
                                                  open ? "basic-menu" : undefined
                                                }
                                                aria-haspopup="true"
                                                aria-expanded={
                                                  open ? "true" : undefined
                                                }
                                                onClick={handleClick}
                                                sx={{ p: 0 }}
                                              >
                                                <ArrowDropDownTwoTone
                                                  onClick={() => setChatId(chat.id)}
                                                />
                                              </IconButton>
                                            </div>
                                          </Link>
                                        </Box>
                                        <Box sx={{ display: "flex", mt: 1 }}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              mb: 1,
                                            }}
                                            color="text.secondary"
                                          >
                                            <Box>
                                              {user.id == chat.car.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id == chat.userId && (
                                                          <Box
                                                            sx={{ display: "flex" }}
                                                          >
                                                            <Avatar
                                                              sx={{
                                                                mr: 1,
                                                                color: "white",
                                                              }}
                                                              alt={userss.username}
                                                              src={`${import.meta.env
                                                                .VITE_FILE_BASE_URL
                                                                }${userss.imageFile}`}
                                                            />
                                                            <Typography
                                                              sx={{ mt: 1 }}
                                                            >
                                                              {userss.username}
                                                            </Typography>
                                                          </Box>
                                                        )}
                                                      </Box>
                                                    );
                                                  })}
                                                </Box>
                                              )}
                                            </Box>
                                            <Box>
                                              {user.id == chat.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id ==
                                                          chat.car.userId && (
                                                            <Link
                                                              to={`/allreviews/${userss.id}/0`}
                                                            >
                                                              <Box
                                                                sx={{ display: "flex" }}
                                                              >
                                                                <Avatar
                                                                  sx={{
                                                                    mr: 1,
                                                                    color: "white",
                                                                  }}
                                                                  alt={userss.username}
                                                                  src={`${import.meta.env
                                                                    .VITE_FILE_BASE_URL
                                                                    }${userss.imageFile}`}
                                                                />
                                                                <Typography
                                                                  sx={{ mt: 1 }}
                                                                >
                                                                  {userss.username}
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
                                        <Box>
                                        {typeof(messageList.filter((message) => message.chatId == chat.id).pop()) != "undefined" &&(
                                          <Typography>{messageList.filter((message) => message.chatId == chat.id).pop().text}</Typography>
                                          )}
                                        </Box>
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}></Box>
                                      {carList.map((car, i) => {
                                        return (
                                          <Box>
                                            {car.id == chat.carId && (
                                              <AspectRatio
                                                sx={{ width: 200, mt: "auto" }}
                                              >
                                                <Box
                                                  component="img"
                                                  src={`${import.meta.env.VITE_FILE_BASE_URL
                                                    }${car.imageFile}`}
                                                  alt="Car Image"
                                                ></Box>
                                              </AspectRatio>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                    <Box>
                                      <Divider sx={{ backgroundColor: "black" }} />
                                    </Box>
                                  </Link>
                                )}
                              </Box>
                            </Box>
                          )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
        {chatList.map((chat, i) => {
          return (
            <Box>
              {carList.map((car, i) => {
                return (
                  <Box>
                    {car.id == chat.carId && (
                      <Box>
                        {user &&
                          (user.id == chat.userId || user.id == car.userId) && (!chat.delete || (chat.delete && (user.id != chat.userDelete1 && user.id != chat.userDelete2 ))) &&(
                            <Box>
                              <Box>
                                {!chat.pinned && (
                                  <Link to={`/messages/${chat.id}`}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        mt: 2,
                                        mb: 2,
                                      }}
                                    >
                                      <Box>
                                        <Box sx={{ display: "flex" }}>
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              color: "#016670",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {chat.car.carmodel}
                                          </Typography>
                                          <Link>
                                            <div onClick={() => setChatDetails(chat)}>
                                              <IconButton
                                                id="basic-button"
                                                aria-controls={
                                                  open ? "basic-menu" : undefined
                                                }
                                                aria-haspopup="true"
                                                aria-expanded={
                                                  open ? "true" : undefined
                                                }
                                                onClick={handleClick}
                                                sx={{ p: 0 }}
                                              >
                                                <ArrowDropDownTwoTone
                                                  onClick={() => setChatId(chat.id)}
                                                />
                                              </IconButton>
                                            </div>
                                          </Link>
                                        </Box>
                                        <Box sx={{ display: "flex", mt: 1 }}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              mb: 1,
                                            }}
                                            color="text.secondary"
                                          >
                                            <Box>
                                              {user.id == chat.car.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id == chat.userId && (
                                                          <Box
                                                            sx={{ display: "flex" }}
                                                          >
                                                            <Avatar
                                                              sx={{
                                                                mr: 1,
                                                                color: "white",
                                                              }}
                                                              alt={userss.username}
                                                              src={`${import.meta.env
                                                                .VITE_FILE_BASE_URL
                                                                }${userss.imageFile}`}
                                                            />
                                                            <Typography
                                                              sx={{ mt: 1 }}
                                                            >
                                                              {userss.username}
                                                            </Typography>
                                                          </Box>
                                                        )}
                                                      </Box>
                                                    );
                                                  })}
                                                </Box>
                                              )}
                                            </Box>
                                            <Box>
                                              {user.id == chat.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id ==
                                                          chat.car.userId && (
                                                            <Link
                                                              to={`/allreviews/${userss.id}/0`}
                                                            >
                                                              <Box
                                                                sx={{ display: "flex" }}
                                                              >
                                                                <Avatar
                                                                  sx={{
                                                                    mr: 1,
                                                                    color: "white",
                                                                  }}
                                                                  alt={userss.username}
                                                                  src={`${import.meta.env
                                                                    .VITE_FILE_BASE_URL
                                                                    }${userss.imageFile}`}
                                                                />
                                                                <Typography
                                                                  sx={{ mt: 1 }}
                                                                >
                                                                  {userss.username}
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
                                        <Box>
                                          {typeof(messageList.filter((message) => message.chatId == chat.id).pop()) != "undefined" &&(
                                            <Typography>{messageList.filter((message) => message.chatId == chat.id).pop().text}</Typography>
                                          )}
                                        </Box>
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}></Box>
                                      {carList.map((car, i) => {
                                        return (
                                          <Box>
                                            {car.id == chat.carId && (
                                              <AspectRatio
                                                sx={{ width: 200, mt: "auto" }}
                                              >
                                                <Box
                                                  component="img"
                                                  src={`${import.meta.env.VITE_FILE_BASE_URL
                                                    }${car.imageFile}`}
                                                  alt="Car Image"
                                                ></Box>
                                              </AspectRatio>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                    <Box>
                                      <Divider sx={{ backgroundColor: "black" }} />
                                    </Box>
                                  </Link>
                                )}
                              </Box>
                            </Box>
                          )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
        {chatList.map((chat, i) => {
          return (
            <Box>
              {carList.map((car, i) => {
                return (
                  <Box>
                    {car.id == chat.carId && (
                      <Box>
                        {user &&
                          (user.id == chat.userId || user.id == car.userId) && (!chat.delete || (chat.delete && (user.id != chat.userDelete1 && user.id != chat.userDelete2 ))) && (
                            <Box>
                              <Box>
                                {chat.pinned && (chat.userPinned1 != user.id && chat.userPinned2 != user.id) && (
                                  <Link to={`/messages/${chat.id}`}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        mt: 2,
                                        mb: 2,
                                      }}
                                    >
                                      <Box>
                                        <Box sx={{ display: "flex" }}>
                                          <Typography
                                            variant="h6"
                                            sx={{
                                              color: "#016670",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {chat.car.carmodel}
                                          </Typography>
                                          <Link>
                                            <div onClick={() => setChatDetails(chat)}>
                                              <IconButton
                                                id="basic-button"
                                                aria-controls={
                                                  open ? "basic-menu" : undefined
                                                }
                                                aria-haspopup="true"
                                                aria-expanded={
                                                  open ? "true" : undefined
                                                }
                                                onClick={handleClick}
                                                sx={{ p: 0 }}
                                              >
                                                <ArrowDropDownTwoTone
                                                  onClick={() => setChatId(chat.id)}
                                                />
                                              </IconButton>
                                            </div>
                                          </Link>
                                        </Box>
                                        <Box sx={{ display: "flex", mt: 1 }}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              mb: 1,
                                            }}
                                            color="text.secondary"
                                          >
                                            <Box>
                                              {user.id == chat.car.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id == chat.userId && (
                                                          <Box
                                                            sx={{ display: "flex" }}
                                                          >
                                                            <Avatar
                                                              sx={{
                                                                mr: 1,
                                                                color: "white",
                                                              }}
                                                              alt={userss.username}
                                                              src={`${import.meta.env
                                                                .VITE_FILE_BASE_URL
                                                                }${userss.imageFile}`}
                                                            />
                                                            <Typography
                                                              sx={{ mt: 1 }}
                                                            >
                                                              {userss.username}
                                                            </Typography>
                                                          </Box>
                                                        )}
                                                      </Box>
                                                    );
                                                  })}
                                                </Box>
                                              )}
                                            </Box>
                                            <Box>
                                              {user.id == chat.userId && (
                                                <Box>
                                                  {userList.map((userss, i) => {
                                                    return (
                                                      <Box>
                                                        {userss.id ==
                                                          chat.car.userId && (
                                                            <Link
                                                              to={`/allreviews/${userss.id}/0`}
                                                            >
                                                              <Box
                                                                sx={{ display: "flex" }}
                                                              >
                                                                <Avatar
                                                                  sx={{
                                                                    mr: 1,
                                                                    color: "white",
                                                                  }}
                                                                  alt={userss.username}
                                                                  src={`${import.meta.env
                                                                    .VITE_FILE_BASE_URL
                                                                    }${userss.imageFile}`}
                                                                />
                                                                <Typography
                                                                  sx={{ mt: 1 }}
                                                                >
                                                                  {userss.username}
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
                                        <Box>
                                        {typeof(messageList.filter((message) => message.chatId == chat.id).pop()) != "undefined" &&(
                                          <Typography>{messageList.filter((message) => message.chatId == chat.id).pop().text}</Typography>
                                          )}                                        
                                        </Box>
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}></Box>
                                      {carList.map((car, i) => {
                                        return (
                                          <Box>
                                            {car.id == chat.carId && (
                                              <AspectRatio
                                                sx={{ width: 200, mt: "auto" }}
                                              >
                                                <Box
                                                  component="img"
                                                  src={`${import.meta.env.VITE_FILE_BASE_URL
                                                    }${car.imageFile}`}
                                                  alt="Car Image"
                                                ></Box>
                                              </AspectRatio>
                                            )}
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                    <Box>
                                      <Divider sx={{ backgroundColor: "black" }} />
                                    </Box>
                                  </Link>
                                )}
                              </Box>
                            </Box>
                          )}
                      </Box>
                    )}
                  </Box>
                );
              })}
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
          {!chatDetails.pinned && (
            <MenuItem onClick={onClickPin}>
              Pin
            </MenuItem>
          )}
          {chatDetails.pinned && (chatDetails.userPinned1 != user.id && chatDetails.userPinned2 != user.id) && (
            <MenuItem onClick={onClickPin}>
              Pin
            </MenuItem>
          )}
          {chatDetails.pinned && (chatDetails.userPinned1 == user.id || chatDetails.userPinned2 == user.id) && (
            <MenuItem onClick={onClickUnpin} sx={{ color: "#DD4052" }}>
              Unpin
            </MenuItem>
          )}
          <MenuItem onClick={handleClickClose} sx={{ color: "#DD4052" }}>
            Delete
          </MenuItem>
        </Menu>
        <Dialog open={open2} onClose={handleClose2}>
          <DialogTitle>Delete Chat</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this chat?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="inherit" onClick={handleClose2}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={deleteChat}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Chats;
