import React, { useState, useEffect, useContext } from "react";
import UserContext from "../contexts/UserContext";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  Paper,
  Container,
} from "@mui/material";
import {
  Search,
  Clear,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useTheme } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PropTypes from "prop-types";
import http from "../http";
import { useNavigate, Link, useParams } from "react-router-dom";

const admintheme = createTheme({
  palette: {
    primary: {
      main: "#003C94",
    },
    secondary: {
      main: "#0044ff",
    },
    input: {
      color: "#003C94",
    },
  },
});

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Container>
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    </Container>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function Reports() {
  const { user } = useContext(UserContext);
  const [reportReviewList, setReportReviewList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [carList, setCarList] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const searchReports = () => {
    http.get(`/reportreview?search=${search}`).then((res) => {
      setReportReviewList(res.data);
    });
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchChats();
    }
  };
  const onClickSearch = () => {
    searchReports();
  };
  const onClickClear = () => {
    setSearch("");
    getReports();
  };

  const getReports = () => {
    http.get("/reportreview").then((res) => {
      setReportReviewList(res.data);
    })
  };

  const marketplace = () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate(`/marketplace`);
    }, []);
  };
  const rows1 = reportReviewList;

  const emptyRows1 =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows1.length) : 0;

  useEffect(() => {
    http.get(`/reportreview`).then((res) => {
      setReportReviewList(res.data);
    });
    http.get(`/car`).then((res) => {
      setCarList(res.data);
    });
    http.get(`/review`).then((res) => {
      setReviewList(res.data);
    });
  }, []);

  return (
    <Container>
      <Box>
        {user && user.isAdmin && (
          <Box>
            <Box sx={{ display: "flex", mt: 3 }}>
              <Typography variant="h4" sx={{ my: 2, color: "#013C94" }}>
                View Reports
              </Typography>
              <Box sx={{ flexGrow: 1 }}></Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ThemeProvider theme={admintheme}>
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
            <Box sx={{ width: "100%" }}>
              <TableContainer component={Paper}>
                <Table
                  sx={{ minWidth: 500 }}
                  aria-label="custom pagination table"
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#013C94" }}>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 20,
                        }}
                      >
                        Product Listing
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 20,
                        }}
                      >
                        Review Posted
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 20,
                        }}
                      >
                        Categories
                      </TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? rows1.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      : rows1
                    ).map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {reviewList.map((review) => (
                            <Box>
                              {row.reviewId == review.id && (
                                <Box>
                                  {carList.map((car) => (
                                    <Box>
                                      {review.carId == car.id && (
                                        <Box>{car.carmodel}</Box>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: 160, wordWrap: "break-word" }}
                          align="right"
                        >
                          {reviewList.map((review) => (
                            <Box>
                              {row.reviewId == review.id && (
                                <Box>{review.description}</Box>
                              )}
                            </Box>
                          ))}
                        </TableCell>
                        <TableCell
                          style={{ maxWidth: 160, wordWrap: "break-word" }}
                          align="right"
                        >
                          {row.title.map((title) => (
                            <Box>{title}</Box>
                          ))}
                          <Box>{row.description}</Box>
                        </TableCell>
                        <TableCell style={{ width: 160 }} align="right">
                          <Link to={`/reviewreview/${row.id}`}>
                            <Button variant="outlined">View Report</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {emptyRows1 > 0 && (
                      <TableRow style={{ height: 53 * emptyRows1 }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[
                          5,
                          10,
                          25,
                          { label: "All", value: -1 },
                        ]}
                        colSpan={3}
                        count={rows1.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        SelectProps={{
                          inputProps: {
                            "aria-label": "rows per page",
                          },
                          native: true,
                        }}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        ActionsComponent={TablePaginationActions}
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
        {user && !user.isAdmin && (
          <Box sx={{ display: "none" }}>{marketplace()}</Box>
        )}
      </Box>
    </Container>
  );
}

export default Reports;
