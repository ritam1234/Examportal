// src/pages/AnalyticsPage.js
// ... (imports remain largely the same) ...
import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { motion } from 'framer-motion'; // Import motion

import { getAllExamsAdmin } from '../api/exams';
// import { getExamParticipationStats, getExamPassFailRatio, getScoreDistribution } from '../api/analytics'; // Import actual API calls
import ExamParticipationChart from '../components/Analytics/ExamParticipationChart';
import PassFailRatioChart from '../components/Analytics/PassFailRatioChart';
import ScoreDistributionChart from '../components/Analytics/ScoreDistributionChart';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // If needed

// --- Animation Variants ---
const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' }
    }),
};

const AnalyticsPage = () => {
    // ... (state remains the same: participationData, passFailData, etc.) ...
    const [participationData, setParticipationData] = useState(null);
    const [passFailData, setPassFailData] = useState(null);
    const [scoreDistribution, setScoreDistribution] = useState([]);
    const [availableExams, setAvailableExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [isLoadingExams, setIsLoadingExams] = useState(true);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const [error, setError] = useState('');
    const [passMark] = useState(60);

    // --- MOCK API Calls (Replace these) ---
    const mockFetchExamParticipation = useCallback(async (examId) => { if(!examId) return {success: false}; await new Promise(res => setTimeout(res, 500)); const taken = Math.floor(Math.random()*40)+5; const total = taken + Math.floor(Math.random()*15); return { success: true, data: { totalAssigned:total, taken, pending:total-taken }}; }, []);
    const mockFetchPassFail = useCallback(async (examId, passPercentage) => { if(!examId) return {success: false}; await new Promise(res => setTimeout(res, 600)); const passed = Math.floor(Math.random()*30)+5; const failed = Math.floor(Math.random()*15)+2; return { success: true, data: { passed, failed } }; }, []);
    const mockFetchScoreDistribution = useCallback(async (examId) => { if (!examId) return { success: true, data: []}; await new Promise(res => setTimeout(res, 400)); const sampleDist = [ { name: '0-19%', count: Math.floor(Math.random()*5)+1}, { name: '20-39%', count: Math.floor(Math.random()*10)+2}, { name: '40-59%', count: Math.floor(Math.random()*15)+5}, { name: '60-79%', count: Math.floor(Math.random()*12)+8}, { name: '80-100%', count: Math.floor(Math.random()*8)+6} ]; return { success: true, data: sampleDist}; }, []);
    // --- End Mocks ---

    // Fetch exams for selector (no change needed)
    useEffect(() => { /* ... */ setIsLoadingExams(true); setError(''); try { getAllExamsAdmin().then(res => { if(res.success) setAvailableExams(res.data||[]); }); } catch(err) { setError('Could not load exams'); } finally { setIsLoadingExams(false); } }, []);

    // Fetch analytics when exam changes (no change needed in logic)
     useEffect(() => {
         const fetchExamAnalytics = async () => {
             if (!selectedExamId) { setParticipationData(null); setPassFailData(null); setScoreDistribution([]); return; }
             setIsLoadingAnalytics(true); setError('');
              try {
                  const [partRes, pfRes, scoreRes] = await Promise.all([
                      mockFetchExamParticipation(selectedExamId), mockFetchPassFail(selectedExamId, passMark), mockFetchScoreDistribution(selectedExamId) ]);
                   setParticipationData(partRes.success ? partRes.data : null);
                   setPassFailData(pfRes.success ? pfRes.data : null);
                   setScoreDistribution(scoreRes.success ? scoreRes.data : []);
                   // ... (partial failure warning if needed) ...
              } catch (err) { setError(err.message || 'Error fetching analytics'); setParticipationData(null); setPassFailData(null); setScoreDistribution([]); } finally { setIsLoadingAnalytics(false); }
         }
         fetchExamAnalytics();
     }, [selectedExamId, passMark, mockFetchExamParticipation, mockFetchPassFail, mockFetchScoreDistribution]);

    const handleExamChange = (event) => setSelectedExamId(event.target.value);

    // --- Render ---
    return (
        // Using Box assuming parent provides padding
        <Box>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap:'wrap' }}>
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                    <Typography variant="h4" component="h1" gutterBottom={false}> Portal Analytics </Typography>
                 </motion.div>
                {/* Exam Selector */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                     <Box sx={{ minWidth: 240 }}>
                        {isLoadingExams ? <CircularProgress size={20}/> :
                             <FormControl fullWidth size="small">
                                <InputLabel id="analytic-exam-select-label">Filter by Exam</InputLabel>
                                <Select labelId="analytic-exam-select-label" value={selectedExamId} label="Filter by Exam" onChange={handleExamChange} disabled={availableExams.length === 0}>
                                    <MenuItem value=""><em>Select Exam for Details</em></MenuItem>
                                     {availableExams.map((exam) => ( <MenuItem key={exam._id} value={exam._id}>{exam.title}</MenuItem> ))}
                                 </Select>
                             </FormControl>
                         }
                     </Box>
                 </motion.div>
            </Box>

             {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

             {/* Analytics Grid */}
             <Grid container spacing={3}>
                   {/* --- Participation --- */}
                   <Grid item xs={12} md={6} lg={4}>
                        <motion.div custom={0} initial="hidden" animate="visible" variants={chartVariants}>
                           <Paper elevation={3} sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
                               <Typography variant="h6" gutterBottom align="center">Participation</Typography>
                               {isLoadingAnalytics ? <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexGrow:1}}><CircularProgress /></Box> :
                                   <ExamParticipationChart data={participationData} />
                               }
                           </Paper>
                        </motion.div>
                   </Grid>

                    {/* --- Pass/Fail --- */}
                    <Grid item xs={12} md={6} lg={4}>
                         <motion.div custom={1} initial="hidden" animate="visible" variants={chartVariants}>
                             <Paper elevation={3} sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
                               <Typography variant="h6" gutterBottom align="center">Pass/Fail Ratio</Typography>
                               <Typography variant="caption" display="block" align="center" sx={{ mb: 1 }}>(Pass @ {passMark}%)</Typography>
                               {isLoadingAnalytics ? <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexGrow:1}}><CircularProgress /></Box> :
                                   <PassFailRatioChart data={passFailData} />
                               }
                             </Paper>
                         </motion.div>
                    </Grid>

                   {/* --- Score Distribution --- */}
                   <Grid item xs={12} md={6} lg={4}>
                       <motion.div custom={2} initial="hidden" animate="visible" variants={chartVariants}>
                           <Paper elevation={3} sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
                               <Typography variant="h6" gutterBottom align="center">Score Distribution</Typography>
                               {isLoadingAnalytics ? <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', flexGrow:1}}><CircularProgress /></Box> :
                                   <ScoreDistributionChart data={scoreDistribution} />
                               }
                            </Paper>
                        </motion.div>
                   </Grid>
             </Grid>

             {/* Placeholder Text */}
              { !selectedExamId && !isLoadingExams && !isLoadingAnalytics && <Typography sx={{mt:4, textAlign:'center', color: 'text.secondary'}}>Select an exam above to view detailed analytics.</Typography> }
              { selectedExamId && !isLoadingAnalytics && !participationData && !passFailData && scoreDistribution.length === 0 && !error && <Typography sx={{mt:4, textAlign:'center', color: 'text.secondary'}}>No analytics data found for the selected exam.</Typography> }


         </Box>
     );
 };

 export default AnalyticsPage;