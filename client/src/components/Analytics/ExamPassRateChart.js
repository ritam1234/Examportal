// src/components/Analytics/ExamPassRateChart.js
import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Typography from '@mui/material/Typography';

// Define colors for pass rate thresholds (example)
const getPassRateColor = (rate) => {
  if (rate >= 80) return '#4caf50'; // Green for high
  if (rate >= 60) return '#ffc107'; // Yellow for medium
  return '#f44336'; // Red for low
};

const ExamPassRateChart = ({ data = [] }) => {
    if (data.length === 0) {
        return <Typography sx={{ textAlign: 'center', mt: 4 }}>No pass rate data available.</Typography>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                layout="vertical" // Make it a horizontal bar chart for better label reading
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="examTitle" type="category" width={150} /* Adjust width as needed */ tick={{ fontSize: 12 }}/>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                 {/* <Legend /> Removed legend as color indicates pass rate */}
                 <Bar dataKey="passRate" name="Pass Rate">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPassRateColor(entry.passRate)} />
                     ))}
                 </Bar>
             </BarChart>
        </ResponsiveContainer>
    );
};

ExamPassRateChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        examTitle: PropTypes.string.isRequired,
        passRate: PropTypes.number.isRequired,
        attemptCount: PropTypes.number, // Optional
    })),
};

export default ExamPassRateChart;