import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import http from '../http';

const BookingChart = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [bookingGoal, setBookingGoal] = useState(15);
  const [carGoal, setCarGoal] = useState(15);
  const [userGoal, setUserGoal] = useState(5);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingsLeft, setBookingsLeft] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const [behindGoalBookings, setBehindGoalBookings] = useState(false);
  const [totalCarsMade, setTotalCarsMade] = useState(0);
  const [totalCarsListed, setTotalCarsListed] = useState(0);
  const [behindGoalCars, setBehindGoalCars] = useState(false);
  const [oldCarsMadeEachDay, setOldCarsMadeEachDay] = useState([]);
  const [totalUserAccounts, setTotalUserAccounts] = useState(0);
  const [userAccountsDeletedEachDay, setUserAccountsDeletedEachDay] = useState([]);
  const [userAccountsDeletedEachDayThisMonth, setUserAccountsDeletedEachDayThisMonth] = useState([]);
  const [behindGoalUserAccounts, setBehindGoalUserAccounts] = useState(false);

  const { user: currentUser } = useContext(UserContext);
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const thisDay = new Date().getDate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsResponse = await http.get('/booking');
        const carsResponse = await http.get('/car');
        const usersResponse = await http.get('/user');
        const deletedUserResponse = await http.get('/deletedusers');
        const carData = carsResponse.data;
        const userData = usersResponse.data;
        const deletedUserList = deletedUserResponse.data;
        const thisMonth = new Date().getMonth() + 1;

        const bookingsThisMonth = Array.from({ length: 31 }, (_, day) =>
          bookingsResponse.data.filter(
            (booking) =>
              new Date(booking.createdAt).getMonth() + 1 === thisMonth &&
              new Date(booking.createdAt).getDate() === day + 1
          ).length
        );

        const carsMadeEachDay = Array.from({ length: 31 }, (_, day) =>
          carData.filter(
            (car) =>
              new Date(car.createdAt).getMonth() + 1 === thisMonth &&
              new Date(car.createdAt).getDate() === day + 1
          ).length
        );

        const carsListedEachDay = Array.from({ length: 31 }, (_, day) =>
          carData.filter(
            (car) =>
              new Date(car.startdate).getMonth() + 1 === thisMonth &&
              new Date(car.startdate).getDate() === day + 1
          ).length
        );

        const userAccountsMadeEachDay = Array.from({ length: 31 }, (_, day) =>
          userData.filter(
            (user) =>
              new Date(user.createdAt).getMonth() + 1 === thisMonth &&
              new Date(user.createdAt).getDate() === day + 1
          ).length
        );

        const totalUserAccountsThisMonth = userData.length;
        const userAccountsDeletedEachDayThisMonth = Array.from({ length: 31 }, (_, day) =>
          deletedUserList.filter(
            (user) => {
              const deletedDate = new Date(user.deletedAt);
              return (
                deletedDate.getMonth() + 1 === thisMonth &&
                deletedDate.getDate() === day + 1
              );
            }
          ).length
        );

        setUserAccountsDeletedEachDayThisMonth(userAccountsDeletedEachDayThisMonth);
        const userAccountsDeletedEachDay = Array.from({ length: 31 }, (_, day) => {
          if (day < thisDay) {
            return userAccountsDeletedEachDayThisMonth[day];
          }
          return 0;
        });


        setUserAccountsDeletedEachDay(userAccountsDeletedEachDay);

        const totalBookingsThisMonth = bookingsThisMonth.reduce(
          (sum, count) => sum + count,
          0
        );
        const cancelledBookingsThisMonth = bookingsResponse.data.filter((booking) => booking.isDeleted).length;
        const validBookingsThisMonth = totalBookingsThisMonth - cancelledBookingsThisMonth; 
        const bookingsLeftToGoal = Math.max(0, bookingGoal - validBookingsThisMonth);
        const behindGoalBookingsThisMonth = validBookingsThisMonth < bookingGoal;

        const totalCarsMadeThisMonth = carsMadeEachDay.reduce((sum, count) => sum + count, 0);
        const totalCarsListedThisMonth = carsListedEachDay.reduce((sum, count) => sum + count, 0);

        const behindGoalCarsThisMonth = totalCarsMadeThisMonth < carGoal;
        const behindGoalUserAccountsThisMonth = totalUserAccounts < userGoal;

        const oldCarsMadeEachDay = Array.from({ length: 31 }, (_, day) =>
          carData.filter(
            (car) =>
              new Date(car.createdAt).getMonth() + 1 === thisMonth &&
              new Date(car.createdAt).getDate() === day + 1
          ).length
        );

        const data = Array.from({ length: 31 }, (_, index) => ({
          name: `${index + 1}`,
          count: bookingsThisMonth[index],
          Goal: index + 1 <= bookingsThisMonth.length && behindGoalBookingsThisMonth ? 3 : undefined,
          cancelled: bookingsResponse.data.filter(
            (booking) =>
              new Date(booking.createdAt).getMonth() + 1 === thisMonth &&
              new Date(booking.createdAt).getDate() === index + 1 &&
              booking.isDeleted
          ).length,
          carsMade: carsMadeEachDay[index],
          carsListed: carsListedEachDay[index],
          userAccountsMade: userAccountsMadeEachDay[index],
          userAccountsDeleted: userAccountsDeletedEachDay[index],
          oldCarsMade: oldCarsMadeEachDay[index],

        }));

        setChartData(data);
        setTotalBookings(validBookingsThisMonth);
        setBookingsLeft(bookingsLeftToGoal);
        setCancelledBookings(cancelledBookingsThisMonth);
        setBehindGoalBookings(behindGoalBookingsThisMonth);
        setTotalCarsMade(totalCarsMadeThisMonth);
        setTotalCarsListed(totalCarsListedThisMonth);
        setBehindGoalCars(behindGoalCarsThisMonth);
        setTotalUserAccounts(totalUserAccountsThisMonth);
        setUserAccountsDeletedEachDay(userAccountsDeletedEachDayThisMonth);
        setBehindGoalUserAccounts(behindGoalUserAccountsThisMonth);
        setOldCarsMadeEachDay(oldCarsMadeEachDay);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Box sx={{ marginBottom: '32px', marginTop: '50px' }}>
        {/* Booking Chart */}
        <Card>
          <CardHeader
            title={
              <Typography variant="h4" sx={{ color: '#013C94' }}>
                Booking Activity
              </Typography>
            }
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Bookings" fill="#1976D2" />
                <Bar dataKey="cancelled" fill="#FFC107" name="Cancelled Bookings" />
              </BarChart>
            </ResponsiveContainer>

            {/* Booking Information */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976D2', fontSize: '1.2rem', textDecoration: 'underline' }}>
                Goal: {bookingGoal} Bookings
              </Typography>
              <Box sx={{ mt: 2, marginLeft: '40px' }}>
                <Typography variant="subtitle1" sx={{ color: '#388E3C', marginBottom: '8px' }}>
                  • Total Bookings: {totalBookings}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#1976D2', marginBottom: '8px' }}>
                  • Bookings Left to Reach Goal: {bookingsLeft}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: behindGoalBookings ? 'error.main' : 'success.main', marginBottom: '8px' }}>
                  • {behindGoalBookings ? 'Status: Behind Goal' : 'Status: On Track'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#FFC107', marginBottom: '8px' }}>
                  • Cancelled Bookings: {cancelledBookings}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Cars Chart */}
        <Box sx={{ marginTop: '32px' }}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h4" sx={{ color: '#016670' }}>
                  Cars Activity
                </Typography>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="carsMade" name="Cars Made" stroke="#8E24AA" />
                  <Line type="monotone" dataKey="carsListed" name="Cars Listed" stroke="#00897B" />
                </LineChart>
              </ResponsiveContainer>

              {/* Cars Information */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#8E24AA', fontSize: '1.2rem', textDecoration: 'underline' }}>
                  Goal: {carGoal} Cars Made
                </Typography>
                <Box sx={{ mt: 2, marginLeft: '40px' }}>
                  <Typography variant="subtitle1" sx={{ color: '#8E24AA', marginBottom: '8px' }}>
                    • Total Cars Made: {totalCarsMade}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#00897B', marginBottom: '8px' }}>
                    • Total Cars Listed: {totalCarsListed}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#8E24AA', marginBottom: '8px' }}>
                    • Cars Left to Reach Goal: {Math.max(0, carGoal - totalCarsMade)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: behindGoalCars ? 'error.main' : 'success.main', marginBottom: '8px' }}>
                    • {behindGoalCars ? 'Status: Behind Goal' : 'Status: On Track'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        {/* User Accounts Chart */}
        <Box sx={{ marginTop: '32px' }}>
          <Card>
            <CardHeader
              title={
                <Typography variant="h4" sx={{ color: '#8B4513' }}>
                  User Accounts Activity
                </Typography>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="userAccountsMade" name="User Accounts Made" strokeDasharray="5 5" stroke="#8B4513" />
                  <Line type="monotone" dataKey="userAccountsDeleted" name="User Accounts Deleted" strokeDasharray="5 5" stroke="#E53935" />
                </LineChart>
              </ResponsiveContainer>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#8B4513', fontSize: '1.2rem', textDecoration: 'underline' }}>
                  Goal: {userGoal} User Accounts
                </Typography>
                <Box sx={{ mt: 2, marginLeft: '40px' }}>
                  <Typography variant="subtitle1" sx={{ color: '#8B4513', marginBottom: '8px' }}>
                    • User Accounts Made: {totalUserAccounts}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#E53935', marginBottom: '8px' }}>
                    • User Accounts Deleted: {userAccountsDeletedEachDay[thisDay - 1]}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#8B4513', marginBottom: '8px' }}>
                    • User Accounts Left to Reach Goal: {Math.max(0, userGoal - totalUserAccounts)}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: behindGoalUserAccounts
                        ? 'error.main'
                        : 'success.main',
                      marginBottom: '8px',
                    }}
                  >
                    •{' '}
                    {behindGoalUserAccounts
                      ? 'Status: Behind Goal'
                      : 'Status: On Track'}
                  </Typography>

                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default BookingChart;
