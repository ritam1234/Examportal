// src/components/Analytics/PassFailRatioChart.js
import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const COLORS = ['#4caf50', '#f44336']; // Green for Pass, Red for Fail

const PassFailRatioChart = ({ data }) => {

     if (!data || data.passed === undefined || data.failed === undefined ) {
        return <Typography sx={{ textAlign: 'center', mt: 4, color:'text.secondary' }}>Select an exam to view pass/fail data.</Typography>;
    }

    const total = data.passed + data.failed;
    if (total === 0) {
         return <Typography sx={{ textAlign: 'center', mt: 4, color:'text.secondary' }}>No attempts recorded for this exam.</Typography>;
     }


    const chartData = [
        { name: 'Passed', value: data.passed },
        { name: 'Failed', value: data.failed },
    ];

     // Calculate percentage for Tooltip/Legend if needed
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
         // Example: Position percentage labels - can be complex
          // const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
          // const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
          // const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
         // return ( <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`} </text> );
        return null; // Keep it simple, use Legend/Tooltip
     };

    return (
         <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}> {/* Adjust height */}
            <ResponsiveContainer>
                 <PieChart>
                     <Pie
                         data={chartData}
                         cx="50%"
                         cy="50%"
                        labelLine={false}
                        // label={renderCustomizedLabel}
                        outerRadius={85} // Adjusted size
                         innerRadius={40} // Make it a Donut chart
                         fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2} // Add padding between segments
                     >
                        {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                     </Pie>
                     <Tooltip formatter={(value, name, props) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}/>
                     <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
                 </PieChart>
             </ResponsiveContainer>
         </Box>
    );
};

PassFailRatioChart.propTypes = {
     data: PropTypes.shape({
         passed: PropTypes.number,
         failed: PropTypes.number,
     }),
 };

 export default PassFailRatioChart;