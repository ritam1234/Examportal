// src/components/Analytics/ExamParticipationChart.js
import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const ExamParticipationChart = ({ data }) => {
    if (!data || data.totalAssigned === undefined || data.taken === undefined || data.pending === undefined) {
         // Show skeleton or message only if actively loading (parent handles loading usually)
         // If selected exam simply has no data, show message.
         return <Typography sx={{ textAlign: 'center', mt: 4, color:'text.secondary' }}>Select an exam to view participation.</Typography>;
    }

    const chartData = [
        {
             name: 'Status', // Single bar group
             Taken: data.taken,
             Pending: data.pending,
             // Total: data.totalAssigned // Can show total if needed
         },
     ];


    return (
        <Box sx={{ width: '100%', height: 'calc(100% - 40px)'}}> {/* Adjust height */}
            <ResponsiveContainer>
                 <BarChart
                     layout="vertical" // Easier for single category
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 >
                    <CartesianGrid strokeDasharray="3 3" />
                     <XAxis type="number" domain={[0, data.totalAssigned > 0 ? data.totalAssigned : 1]} /* Set max based on total */ allowDecimals={false} />
                     <YAxis type="category" dataKey="name" hide /> {/* Hide Y-axis label for single bar */}
                    <Tooltip />
                     <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
                    <Bar dataKey="Taken" stackId="a" fill="#4caf50" name="Taken" />
                    <Bar dataKey="Pending" stackId="a" fill="#ffc107" name="Pending" />
                     {/* <Bar dataKey="Total" fill="#8884d8" /> */}
                </BarChart>
            </ResponsiveContainer>
             <Typography variant="caption" display="block" align="center" sx={{mt:1}}>
                 Total Assigned: {data.totalAssigned}
             </Typography>
         </Box>
    );
};

ExamParticipationChart.propTypes = {
    data: PropTypes.shape({
        totalAssigned: PropTypes.number,
        taken: PropTypes.number,
        pending: PropTypes.number,
    }),
};

export default ExamParticipationChart;