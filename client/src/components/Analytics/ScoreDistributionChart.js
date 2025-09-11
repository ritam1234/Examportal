// src/components/Analytics/ScoreDistributionChart.js
import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';

// Define colors for the pie chart segments
const COLORS = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50']; // Example: Red to Green

const ScoreDistributionChart = ({ data = [] }) => {
    if (data.length === 0) {
        return <Typography sx={{ textAlign: 'center', mt: 4 }}>No score distribution data available for the selected exam.</Typography>;
    }

     // Ensure data has counts and is sorted logically if needed
     // const sortedData = [...data].sort(...); // Sort if order matters

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Optional labels on chart
                    outerRadius={80} // Adjust size
                    fill="#8884d8"
                     dataKey="count" // The value to determine segment size
                     nameKey="name"  // The label for the segment
                 >
                    {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} students`, name]}/>
                <Legend layout="vertical" verticalAlign="middle" align="right"/>
            </PieChart>
        </ResponsiveContainer>
    );
};

ScoreDistributionChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired, // e.g., '0-20%'
        count: PropTypes.number.isRequired, // Number of students in this bracket
    })),
};

export default ScoreDistributionChart;