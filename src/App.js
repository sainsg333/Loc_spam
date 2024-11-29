import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    Button,
    TextField,
    TextareaAutosize,
    Typography,
    Card,
    CardContent,
    Grid,
    Alert,
    AppBar,
    Toolbar,
    Box,
    Container,
} from '@mui/material';

const App = () => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState(null);
    const [spamResult, setSpamResult] = useState(null);
    const [locations, setLocations] = useState([]);

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    const fetchLocation = async () => {
        try {
            const response = await axios.get('https://api64.ipify.org?format=json'); 
            const ip = response.data.ip;
            const res = await axios.post('http://127.0.0.1:5000/get-location', { ip, email, phone });
            setLocation({
                city: res.data.city,
                region: res.data.region,
                country: res.data.country_name,
                lat: res.data.latitude,
                lng: res.data.longitude,
            });
        } catch (err) {
            console.error('Error fetching location:', err);
        }
    };

    const detectSpam = async () => {
        try {
            const res = await axios.post('http://127.0.0.1:5000/detect', {
                message,
                location: location ? location.city : 'Unknown',
            });
            setSpamResult(res.data);

            if (res.data.is_spam && location) {
                setLocations((prev) => [
                    ...prev,
                    { lat: location.lat, lng: location.lng, message },
                ]);
            }
        } catch (err) {
            console.error('Error detecting spam:', err);
        }
    };

    return (
        <Container maxWidth="lg">
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography variant="h6">Spam Detection and Location Monitoring</Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Card sx={{ boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Enter Details
                                </Typography>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <TextareaAutosize
                                    placeholder="Enter message here..."
                                    minRows={4}
                                    style={{
                                        width: '100%',
                                        marginTop: '16px',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <Box mt={2} display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={fetchLocation}
                                    >
                                        Get Location
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={detectSpam}
                                    >
                                        Check Spam
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {spamResult && (
                            <Alert severity={spamResult.is_spam ? 'error' : 'success'}>
                                {spamResult.is_spam ? 'Spam detected!' : 'Message is safe.'}
                            </Alert>
                        )}
                        {spamResult && (
                            <Box mt={2}>
                                <Typography variant="h6">Result:</Typography>
                                <Typography>Message: {spamResult.message}</Typography>
                                <Typography>
                                    Spam: {spamResult.is_spam ? 'Yes' : 'No'}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        Spam Locations
                    </Typography>
                    <MapContainer
                        center={[20, 77]}
                        zoom={4}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {location && (
                            <Marker
                                position={[location.lat, location.lng]}
                                icon={redIcon}
                            >
                                <Popup>
                                    {location.city}, {location.region}, {location.country}
                                </Popup>
                            </Marker>
                        )}
                        {locations.map((loc, index) => (
                            <Marker
                                key={index}
                                position={[loc.lat, loc.lng]}
                                icon={redIcon}
                            >
                                <Popup>{loc.message}</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Box>
            </Box>
        </Container>
    );
};

export default App;
