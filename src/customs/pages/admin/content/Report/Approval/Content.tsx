



// import { useMemo, useState } from 'react';

// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Alert,
//   Autocomplete,
//   Avatar,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   CircularProgress,
//   Divider,
//   Grid2 as Grid,
//   InputAdornment,
//   Stack,
//   TextField,
//   Typography,
// } from '@mui/material';

// import {
//   IconCalendar,
//   IconChevronDown,
//   IconClock,
//   IconDownload,
//   IconFilter,
//   IconRefresh,
//   IconSearch,
//   IconUsers,
//   IconCheck,
//   IconX,
//   IconHourglass,
//   IconFileDescription,
//   IconFileExport,
// } from '@tabler/icons-react';

// import dayjs from 'dayjs';

// import { useQuery } from '@tanstack/react-query';

// import Container from 'src/components/container/PageContainer';
// import PageContainer from 'src/customs/components/container/PageContainer';

// import {
//   AdminCustomSidebarItemsData,
//   AdminNavListingData,
// } from 'src/customs/components/header/navigation/AdminMenu';

// import { getVisitorEmployee } from 'src/customs/api/admin';


// import { showSwal } from
//   'src/customs/components/alerts/alerts';
// import { useReportApproval } from 'src/hooks/Report/useReportApproval';
// import { formatDateTimeTime } from 'src/utils/formatDateTimePeriodEnd';
// import { useUserPagination } from 'src/hooks/User/useUsers';
// import { exportReportApproval } from 'src/customs/api/Admin/Report';

// // =====================================================
// // TYPES
// // =====================================================

// interface ApprovalActor {
//   approver_name: string;
//   approver_type: string;
//   status: string;
//   approved_at?: string | null;
//   is_final: boolean;
//   is_reviewer: boolean;
// }

// interface ApprovalVisitor {
//   agenda: string;
//   workflow_type?: string;
//   visitor_code: string;
//   identity_id: string;
//   visitor_period_start: string;
//   visitor_period_end: string;
//   visitor_name: string;
//   host_name: string;
//   approval_status: string;
//   approval_actor_approved: string[];
//   approval_actor_rejected: string[];
//   actors: ApprovalActor[];
//   approval_ticket_id?: string;
// }

// interface ApprovalTicket {
//   ticket_id: string;
//   ticket_name: string;
//   workflow_type: string;
//   current_step: number;
//   approval_status: string;
//   created_at: string;
//   actors: ApprovalActor[];
// }

// interface ApprovalTransaction {
//   transaction_visitor_id: string;
//   agenda: string;
//   workflow_type?: string;
//   approval_ticket_name?: string;
//   current_step?: number;
//   visitor_period_start: string;
//   visitor_period_end: string;
//   total_visitor: number;
//   total_visitor_approved: number;
//   total_visitor_rejected: number;
//   total_visitor_pending: number;
//   host_name: string;
//   approval_status: string;
//   rejection_reasons: string[];
//   data_history_ticket: ApprovalTicket[];
//   data_history_visitor: ApprovalVisitor[];
// }

// interface ApprovalReportResponse {
//   collection: {
//     filter?: any;
//     by_transaction_visitor: {
//       summary_total: {
//         pending: number;
//         approved: number;
//         rejected: number;
//       };
//       data_visitor: ApprovalTransaction[];
//     };
//   };
// }



// const getStatusColor = (
//   status?: string,
// ): 'success' | 'error' | 'warning' | 'default' => {
//   switch (status?.toLowerCase()) {
//     case 'approved':
//       return 'success';

//     case 'rejected':
//       return 'error';

//     case 'pending':
//       return 'warning';

//     default:
//       return 'default';
//   }
// };

// const StatusChip = ({ status }: { status?: string }) => (
//   <Chip
//     size="small"
//     label={status || 'Unknown'}
//     color={getStatusColor(status)}
//     variant="outlined"
//     sx={{
//       fontWeight: 600,
//       textTransform: 'capitalize',
//       minWidth: 75,
//     }}
//   />
// );

// // =====================================================
// // SUMMARY CARD
// // =====================================================

// interface SummaryCardProps {
//   title: string;
//   value: number;
//   description: string;
//   icon: React.ReactNode;
//   color: string;
//   background: string;
// }

// const SummaryCard = ({
//   title,
//   value,
//   description,
//   icon,
//   color,
//   background,
// }: SummaryCardProps) => (
//   <Card
//     elevation={0}
//     sx={{
//       border: '1px solid',
//       borderColor: 'divider',
//       height: '100%',
//       borderRadius: 2,
//     }}
//   >
//     <CardContent sx={{ p: 2.5 }}>
//       <Stack
//         direction="row"
//         alignItems="center"
//         justifyContent="space-between"
//         mb={2}
//       >
//         <Typography
//           color="text.secondary"
//           fontSize={16}
//           fontWeight={600}
//         >
//           {title}
//         </Typography>

//         <Box
//           sx={{
//             width: 42,
//             height: 42,
//             borderRadius: 2,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color,
//             backgroundColor: background,
//           }}
//         >
//           {icon}
//         </Box>
//       </Stack>

//       <Typography
//         variant="h3"
//         fontWeight={700}
//         sx={{ color }}
//       >
//         {value.toLocaleString()}
//       </Typography>

//       <Typography
//         variant="caption"
//         color="text.secondary"
//       >
//         {description}
//       </Typography>
//     </CardContent>
//   </Card>
// );

// // =====================================================
// // APPROVAL ACTOR TIMELINE
// // =====================================================

// const ApprovalActorList = ({
//   actors,
// }: {
//   actors: ApprovalActor[];
// }) => {
//   if (!actors?.length) {
//     return (
//       <Typography
//         variant="body2"
//         color="text.secondary"
//         sx={{ py: 1 }}
//       >
//         No approval history available.
//       </Typography>
//     );
//   }

//   return (
//     <Stack spacing={0}>
//       {actors.map((actor, index) => (
//         <Stack
//           key={`${actor.approver_name}-${actor.approver_type}-${index}`}
//           direction="row"
//           spacing={1.5}
//           alignItems="flex-start"
//           sx={{ pb: 2 }}
//         >
//           <Box
//             sx={{
//               position: 'relative',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//             }}
//           >
//             <Avatar
//               sx={{
//                 width: 36,
//                 height: 36,
//                 fontSize: 14,
//                 fontWeight: 600,
//                 bgcolor: 'primary.light',
//                 color: 'primary.main',
//               }}
//             >
//               {actor.approver_name?.charAt(0)?.toUpperCase() || '?'}
//             </Avatar>

//             {index !== actors.length - 1 && (
//               <Box
//                 sx={{
//                   width: 2,
//                   height: 28,
//                   bgcolor: 'divider',
//                   mt: 0.5,
//                 }}
//               />
//             )}
//           </Box>

//           <Box flex={1} minWidth={0}>
//             <Stack
//               direction="row"
//               justifyContent="space-between"
//               alignItems="center"
//               flexWrap="wrap"
//               gap={1}
//             >
//               <Box>
//                 <Typography
//                   variant="body2"
//                   fontWeight={700}
//                 >
//                   {actor.approver_name || '-'}
//                 </Typography>

//                 <Typography
//                   variant="caption"
//                   color="text.secondary"
//                 >
//                   {actor.approver_type || '-'}
//                   {actor.is_final && ' • Final Approval'}
//                   {actor.is_reviewer && ' • Reviewer'}
//                 </Typography>
//               </Box>

//               <StatusChip status={actor.status} />
//             </Stack>

//             {actor.approved_at && (
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 display="block"
//                 mt={0.5}
//               >
//                 <IconClock
//                   size={12}
//                   style={{
//                     verticalAlign: 'middle',
//                     marginRight: 4,
//                   }}
//                 />
//                 {formatDateTimeTime(actor.approved_at)}
//               </Typography>
//             )}
//           </Box>
//         </Stack>
//       ))}
//     </Stack>
//   );
// };

// // =====================================================
// // VISITOR DETAIL
// // =====================================================

// const VisitorDetail = ({
//   visitor,
//   index,
// }: {
//   visitor: ApprovalVisitor;
//   index: number;
// }) => (
//   <Card
//     variant="outlined"
//     sx={{
//       mb: 2,
//       borderRadius: 2,
//       overflow: 'hidden',
//     }}
//   >
//     <Box sx={{ p: 2 }}>
//       <Stack
//         direction={{ xs: 'column', sm: 'row' }}
//         alignItems={{ xs: 'flex-start', sm: 'center' }}
//         justifyContent="space-between"
//         spacing={1}
//         mb={2}
//       >
//         <Stack direction="row" spacing={1.5} alignItems="center">
//           <Avatar
//             sx={{
//               width: 42,
//               height: 42,
//               bgcolor: 'primary.light',
//               color: 'primary.main',
//               fontWeight: 700,
//             }}
//           >
//             {visitor.visitor_name?.charAt(0)?.toUpperCase() || '?'}
//           </Avatar>

//           <Box>
//             <Typography fontWeight={700}>
//               {visitor.visitor_name || '-'}
//             </Typography>

//             <Typography
//               variant="caption"
//               color="text.secondary"
//             >
//               Visitor Code: {visitor.visitor_code || '-'}
//             </Typography>
//           </Box>
//         </Stack>

//         <StatusChip status={visitor.approval_status} />
//       </Stack>

//       <Grid container spacing={2}>
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Typography variant="caption" color="text.secondary">
//             Identity ID
//           </Typography>
//           <Typography variant="body2" fontWeight={500}>
//             {visitor.identity_id || '-'}
//           </Typography>
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Typography variant="caption" color="text.secondary">
//             Host
//           </Typography>
//           <Typography variant="body2" fontWeight={500}>
//             {visitor.host_name || '-'}
//           </Typography>
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Typography variant="caption" color="text.secondary">
//             Visit Start
//           </Typography>
//           <Typography variant="body2" fontWeight={500}>
//             {formatDateTimeTime(visitor.visitor_period_start)}
//           </Typography>
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Typography variant="caption" color="text.secondary">
//             Visit End
//           </Typography>
//           <Typography variant="body2" fontWeight={500}>
//             {visitor.visitor_period_end === '9999-01-01T00:00:00'
//               ? '-'
//               : formatDateTimeTime(
//                 visitor.visitor_period_end,
//                 visitor.extend_visitor_period
//               )}
//           </Typography>
//         </Grid>
//       </Grid>

//       <Divider sx={{ my: 2 }} />

//       <Typography
//         variant="subtitle2"
//         fontWeight={700}
//         mb={1.5}
//       >
//         Approval History
//       </Typography>

//       <ApprovalActorList actors={visitor.actors || []} />

//       {visitor.approval_actor_approved?.length > 0 && (
//         <Box mt={1}>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             display="block"
//             mb={0.5}
//           >
//             Approved By
//           </Typography>

//           <Stack direction="row" flexWrap="wrap" gap={0.5}>
//             {visitor.approval_actor_approved.map((name, i) => (
//               <Chip
//                 key={`${name}-${i}`}
//                 size="small"
//                 label={name}
//                 color="success"
//                 variant="outlined"
//               />
//             ))}
//           </Stack>
//         </Box>
//       )}

//       {visitor.approval_actor_rejected?.length > 0 && (
//         <Box mt={1}>
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             display="block"
//             mb={0.5}
//           >
//             Rejected By
//           </Typography>

//           <Stack direction="row" flexWrap="wrap" gap={0.5}>
//             {visitor.approval_actor_rejected.map((name, i) => (
//               <Chip
//                 key={`${name}-${i}`}
//                 size="small"
//                 label={name}
//                 color="error"
//                 variant="outlined"
//               />
//             ))}
//           </Stack>
//         </Box>
//       )}
//     </Box>
//   </Card>
// );

// // =====================================================
// // MAIN PAGE
// // =====================================================

// const Content = () => {
//   const timezone =
//     Intl.DateTimeFormat().resolvedOptions().timeZone ||
//     'Asia/Jakarta';

//   // FILTER STATE
//   const [startDate, setStartDate] = useState(
//     dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
//   );

//   const [endDate, setEndDate] = useState(
//     dayjs().format('YYYY-MM-DD'),
//   );

//   const [actorId, setActorId] = useState<string | null>(null);

//   const [keyword, setKeyword] = useState('');

//   const [report, setReport] =
//     useState<ApprovalReportResponse | null>(null);

//   const [hasGenerated, setHasGenerated] = useState(false);

//   // API MUTATION
//   const {
//     mutateAsync,
//     isPending,
//   } = useReportApproval();

//   const [employeeKeyword, setEmployeeKeyword] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerpage] = useState(10);

//   // EMPLOYEE OPTIONS
//   const {
//     data: employeeResponse,
//     isLoading: loadingEmployee,
//     isFetching: fetchingEmployee,
//   } = useUserPagination({
//     page,
//     rowsPerPage,
//     sortDir: 'desc',
//     searchKeyword: employeeKeyword,
//     'is-employee': true,
//   });

//   const employeeOptions = employeeResponse?.collection ?? [];

//   // REPORT DATA
//   const summary =
//     report?.collection?.by_transaction_visitor?.summary_total;

//   const transactions =
//     report?.collection?.by_transaction_visitor?.data_visitor ?? [];

//   // GENERATE REPORT
//   const handleGenerate = async (isExport = false) => {
//     if (!startDate || !endDate) {
//       showSwal('error', 'Please select start date and end date.');
//       return;
//     }

//     if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
//       showSwal('error', 'End date cannot be earlier than start date.');
//       return;
//     }

//     try {
//       // const startDateUtc = dayjs
//       //   .tz(startDate, timezone)
//       //   .startOf('day')
//       //   .utc()
//       //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

//       // const endDateUtc = dayjs
//       //   .tz(endDate, timezone)
//       //   .endOf('day')
//       //   .utc()
//       //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

//       const payload = {
//         start_date: startDate,
//         end_date: endDate,
//         timezone,
//         is_export: isExport,
//         export_report: 'Excell',
//         actor_id: actorId,
//       };

//       // EXPORT EXCEL
//       if (isExport) {
//         const response = await exportReportApproval(payload);

//         const url = window.URL.createObjectURL(response);

//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `approval-report-${startDate}-${endDate}.xlsx`;

//         document.body.appendChild(link);
//         link.click();
//         link.remove();

//         window.URL.revokeObjectURL(url);

//         // showSwal('success', 'Approval report exported successfully.');
//         return;
//       }

//       // GENERATE REPORT JSON
//       const response = await mutateAsync(payload);

//       setReport(response);
//       setHasGenerated(true);
//     } catch (error) {
//       console.error('Approval report error:', error);

//       showSwal(
//         'error',
//         isExport
//           ? 'Failed to export approval report.'
//           : 'Failed to generate approval report.',
//       );
//     }
//   };

//   // RESET FILTER
//   const handleReset = () => {
//     setStartDate(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
//     setEndDate(dayjs().format('YYYY-MM-DD'));
//     setActorId(null);
//     setKeyword('');
//     setReport(null);
//     setHasGenerated(false);
//   };

//   // SEARCH TRANSACTION
//   const filteredTransactions = useMemo(() => {
//     const search = keyword.trim().toLowerCase();

//     if (!search) return transactions;

//     return transactions.filter((item) => {
//       const values = [
//         item.agenda,
//         item.host_name,
//         item.approval_status,
//         item.approval_ticket_name,
//         item.workflow_type,
//         item.transaction_visitor_id,
//       ];

//       return values.some((value) =>
//         String(value ?? '').toLowerCase().includes(search),
//       );
//     });
//   }, [transactions, keyword]);

//   const isInvalidDate =
//     !startDate ||
//     !endDate ||
//     dayjs(endDate).isBefore(dayjs(startDate), 'day');



//   return (
//     <PageContainer
//       itemDataCustomNavListing={AdminNavListingData}
//       itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
//     >
//       <Container
//         title="Report Approval"
//         description="Approval Workflow Monitoring Report"
//       >
//         <Box sx={{ pb: 3 }}>

//           {/* HEADER */}
//           <Stack
//             direction={{ xs: 'column', sm: 'row' }}
//             alignItems={{ xs: 'flex-start', sm: 'center' }}
//             justifyContent="space-between"
//             spacing={2}
//             mb={3}
//           >
//             <Box>
//               <Typography variant="h4" fontWeight={700}>
//                 Approval Report
//               </Typography>

//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 mt={0.5}
//               >
//                 Monitor visitor approval transactions and workflow history.
//               </Typography>
//             </Box>

//             {hasGenerated && (
//               <Chip
//                 icon={<IconCheck size={16} />}
//                 label="Report Generated"
//                 color="success"
//                 variant="outlined"
//               />
//             )}
//           </Stack>

//           {/* FILTER CARD */}
//           <Card
//             elevation={0}
//             sx={{
//               border: '1px solid',
//               borderColor: 'divider',
//               borderRadius: 2,
//               mb: 3,
//             }}
//           >
//             <CardContent sx={{ p: 3 }}>
//               <Stack
//                 direction="row"
//                 alignItems="center"
//                 spacing={1}
//                 mb={2.5}
//               >
//                 <IconFilter size={21} />

//                 <Typography variant="h6" fontWeight={700}>
//                   Report Filters
//                 </Typography>
//               </Stack>

//               <Grid container spacing={2}>
//                 {/* START DATE */}
//                 <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//                   <Typography
//                     variant="body2"
//                     fontWeight={600}
//                     mb={0.8}
//                   >
//                     Start Date
//                   </Typography>

//                   <TextField
//                     fullWidth
//                     size="small"
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     InputLabelProps={{ shrink: true }}
//                     inputProps={{
//                       max: endDate || undefined,
//                     }}
//                   />
//                 </Grid>

//                 {/* END DATE */}
//                 <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//                   <Typography
//                     variant="body2"
//                     fontWeight={600}
//                     mb={0.8}
//                   >
//                     End Date
//                   </Typography>

//                   <TextField
//                     fullWidth
//                     size="small"
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     InputLabelProps={{ shrink: true }}
//                     inputProps={{
//                       min: startDate || undefined,
//                     }}
//                   />
//                 </Grid>

//                 {/* ACTOR */}
//                 <Grid size={{ xs: 12, md: 4 }}>
//                   <Typography
//                     variant="body2"
//                     fontWeight={600}
//                     mb={0.8}
//                   >
//                     Approval Actor
//                   </Typography>

//                   <Autocomplete
//                     fullWidth
//                     size="small"
//                     options={employeeOptions}
//                     loading={loadingEmployee}
//                     value={
//                       employeeOptions.find(
//                         (item: any) => item.id === actorId,
//                       ) ?? null
//                     }
//                     getOptionLabel={(option: any) =>
//                       option.name ?? ''
//                     }
//                     isOptionEqualToValue={(option: any, value: any) =>
//                       option.id === value.id
//                     }
//                     onChange={(_, value) =>
//                       setActorId(value?.id ?? null)
//                     }
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         placeholder="All Actors"
//                         InputProps={{
//                           ...params.InputProps,
//                           endAdornment: (
//                             <>
//                               {loadingEmployee && (
//                                 <CircularProgress
//                                   color="inherit"
//                                   size={16}
//                                 />
//                               )}
//                               {params.InputProps.endAdornment}
//                             </>
//                           ),
//                         }}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 {/* ACTION */}
//                 <Grid size={{ xs: 12, md: 2 }}>
//                   <Typography
//                     variant="body2"
//                     fontWeight={600}
//                     mb={0.8}
//                   >
//                     &nbsp;
//                   </Typography>

//                   <Stack direction="row" spacing={1}>
//                     <Button
//                       fullWidth
//                       variant="contained"
//                       onClick={() => handleGenerate(false)}
//                       disabled={isPending || isInvalidDate}
//                       sx={{
//                         height: 40,
//                         textTransform: 'none',
//                         fontWeight: 600,
//                       }}
//                     >
//                       {isPending ? (
//                         <CircularProgress size={20} color="inherit" />
//                       ) : (
//                         'Generate'
//                       )}
//                     </Button>

//                     <Button
//                       fullWidth
//                       variant="outlined"
//                       color="error"
//                       onClick={handleReset}
//                       disabled={isPending}
//                       sx={{ minWidth: 42, height: 40 }}
//                     >
//                       {/* <IconRefresh size={19} /> */}
//                       Reset
//                     </Button>
//                   </Stack>
//                 </Grid>

//                 {/* TIMEZONE */}
//                 <Grid size={{ xs: 12 }}>
//                   <Stack
//                     direction="row"
//                     spacing={0.7}
//                     alignItems="center"
//                   >
//                     <IconClock size={15} color="gray" />

//                     <Typography
//                       variant="caption"
//                       color="text.secondary"
//                     >
//                       Timezone: {timezone}
//                     </Typography>
//                   </Stack>
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>

//           {/* LOADING */}
//           {isPending && (
//             <Card sx={{ p: 5, mb: 3, textAlign: 'center' }}>
//               <CircularProgress size={35} />

//               <Typography mt={2} fontWeight={600}>
//                 Generating Approval Report...
//               </Typography>

//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 mt={0.5}
//               >
//                 Please wait while we process your report.
//               </Typography>
//             </Card>
//           )}

//           {/* EMPTY STATE */}
//           {!report && !isPending && (
//             <Card
//               elevation={0}
//               sx={{
//                 border: '1px dashed',
//                 borderColor: 'divider',
//                 borderRadius: 2,
//                 p: { xs: 4, md: 7 },
//                 textAlign: 'center',
//               }}
//             >
//               <Box
//                 sx={{
//                   width: 65,
//                   height: 65,
//                   mx: 'auto',
//                   mb: 2,
//                   borderRadius: '50%',
//                   backgroundColor: 'action.hover',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                 }}
//               >
//                 <IconFileDescription
//                   size={32}
//                   color="gray"
//                 />
//               </Box>

//               <Typography variant="h6" fontWeight={700}>
//                 No Report Generated
//               </Typography>

//               <Typography
//                 color="text.secondary"
//                 variant="body2"
//                 mt={1}
//               >
//                 Select your report filters and click Generate
//                 to view approval transactions.
//               </Typography>
//             </Card>
//           )}

//           {/* REPORT CONTENT */}
//           {report && !isPending && (
//             <>
//               {/* SUMMARY */}
//               <Grid container spacing={2} mb={3}>
//                 <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                   <SummaryCard
//                     title="Pending"
//                     value={summary?.pending ?? 0}
//                     description="Waiting for approval"
//                     icon={<IconHourglass size={23} />}
//                     color="#ED9B22"
//                     background="rgba(237,155,34,0.12)"
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                   <SummaryCard
//                     title="Approved"
//                     value={summary?.approved ?? 0}
//                     description="Successfully approved"
//                     icon={<IconCheck size={23} />}
//                     color="#16A34A"
//                     background="rgba(22,163,74,0.12)"
//                   />
//                 </Grid>

//                 <Grid size={{ xs: 12, sm: 6, md: 4 }}>
//                   <SummaryCard
//                     title="Rejected"
//                     value={summary?.rejected ?? 0}
//                     description="Rejected transactions"
//                     icon={<IconX size={23} />}
//                     color="#DC2626"
//                     background="rgba(220,38,38,0.12)"
//                   />
//                 </Grid>
//               </Grid>

//               {/* TRANSACTION SECTION */}
//               <Card
//                 elevation={0}
//                 sx={{
//                   border: '1px solid',
//                   borderColor: 'divider',
//                   borderRadius: 2,
//                 }}
//               >
//                 <CardContent sx={{ p: 3 }}>
//                   {/* TABLE HEADER */}
//                   <Stack
//                     direction={{ xs: 'column', md: 'row' }}
//                     alignItems={{ xs: 'stretch', md: 'center' }}
//                     justifyContent="space-between"
//                     spacing={2}
//                     mb={3}
//                   >
//                     <Box>
//                       <Typography variant="h6" fontWeight={700}>
//                         Transaction Approval
//                       </Typography>

//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                       >
//                         {filteredTransactions.length} transactions found
//                       </Typography>
//                     </Box>

//                     <Stack
//                       direction={{ xs: 'column', sm: 'row' }}
//                       spacing={1}
//                     >
//                       <TextField
//                         size="small"
//                         placeholder="Search transaction..."
//                         value={keyword}
//                         onChange={(e) => setKeyword(e.target.value)}
//                         sx={{ minWidth: { sm: 230 } }}
//                         InputProps={{
//                           startAdornment: (
//                             <InputAdornment position="start">
//                               <IconSearch size={18} />
//                             </InputAdornment>
//                           ),
//                         }}
//                       />

//                       <Button
//                         variant="outlined"
//                         color="success"
//                         startIcon={<IconFileExport size={18} />}
//                         onClick={() => handleGenerate(true)}
//                         disabled={isPending}
//                         sx={{
//                           textTransform: 'none',
//                           whiteSpace: 'nowrap',
//                         }}
//                       >
//                         Export Excel
//                       </Button>
//                     </Stack>
//                   </Stack>

//                   <Divider sx={{ mb: 2 }} />

//                   {/* TRANSACTION LIST */}
//                   {filteredTransactions.length === 0 ? (
//                     <Alert severity="info">
//                       No transactions found.
//                     </Alert>
//                   ) : (
//                     <Stack spacing={1.5}>
//                       {filteredTransactions.map((item) => (
//                         <Accordion
//                           key={item.transaction_visitor_id}
//                           disableGutters
//                           elevation={0}
//                           sx={{
//                             border: '1px solid',
//                             borderColor: 'divider',
//                             borderRadius: '10px !important',
//                             overflow: 'hidden',
//                             '&:before': {
//                               display: 'none',
//                             },
//                           }}
//                         >
//                           <AccordionSummary
//                             expandIcon={
//                               <IconChevronDown size={20} />
//                             }
//                             sx={{
//                               px: 2,
//                               py: 1.5,
//                               '& .MuiAccordionSummary-content': {
//                                 my: 0,
//                               },
//                             }}
//                           >
//                             <Grid
//                               container
//                               spacing={2}
//                               alignItems="center"
//                               width="100%"
//                             >
//                               {/* AGENDA */}
//                               <Grid size={{ xs: 12, md: 3.5 }}>
//                                 <Typography
//                                   fontWeight={700}
//                                   variant="body1"
//                                 >
//                                   {item.agenda || '-'}
//                                 </Typography>

//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                   display="block"
//                                 >
//                                   Host: {item.host_name || '-'}
//                                 </Typography>

//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                   display="block"
//                                 >
//                                   <IconCalendar
//                                     size={12}
//                                     style={{
//                                       verticalAlign: 'middle',
//                                       marginRight: 4,
//                                     }}
//                                   />
//                                   {formatDateTimeTime(item.visitor_period_start)}
//                                 </Typography>
//                               </Grid>

//                               {/* VISITOR */}
//                               <Grid size={{ xs: 4, md: 1.5 }}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Total Visitors
//                                 </Typography>

//                                 <Stack
//                                   direction="row"
//                                   spacing={0.5}
//                                   alignItems="center"
//                                 >
//                                   <IconUsers size={17} />

//                                   <Typography fontWeight={700}>
//                                     {item.total_visitor ?? 0}
//                                   </Typography>
//                                 </Stack>
//                               </Grid>

//                               {/* WORKFLOW */}
//                               <Grid size={{ xs: 4, md: 1.5 }}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Current Step
//                                 </Typography>

//                                 <Typography fontWeight={700}>
//                                   {item.current_step ?? '-'}
//                                 </Typography>
//                               </Grid>

//                               {/* APPROVAL COUNTS */}
//                               <Grid size={{ xs: 12, md: 3.5 }}>
//                                 <Stack
//                                   direction="row"
//                                   flexWrap="wrap"
//                                   gap={0.5}
//                                 >
//                                   <Chip
//                                     size="small"
//                                     color="success"
//                                     label={`Approved ${item.total_visitor_approved ?? 0}`}
//                                   />

//                                   <Chip
//                                     size="small"
//                                     color="error"
//                                     label={`Rejected ${item.total_visitor_rejected ?? 0}`}
//                                   />

//                                   <Chip
//                                     size="small"
//                                     color="warning"
//                                     label={`Pending ${item.total_visitor_pending ?? 0}`}
//                                   />
//                                 </Stack>

//                                 {/* <Box mt={0.7} sx={{ display: 'flex', gap: 2 , alignItems: 'center'}}>
//                                   <Typography>Last Status</Typography>
//                                   <StatusChip
//                                     status={item.approval_status}
//                                   />
//                                 </Box> */}
//                               </Grid>

//                               {/* WORKFLOW TYPE */}
//                               <Grid size={{ xs: 8, md: 2 }}>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Workflow Type
//                                 </Typography>

//                                 <Typography
//                                   variant="body2"
//                                   fontWeight={600}
//                                 >
//                                   {item.workflow_type || '-'}
//                                 </Typography>
//                               </Grid>
//                             </Grid>
//                           </AccordionSummary>

//                           {/* EXPANDED CONTENT */}
//                           <AccordionDetails
//                             sx={{
//                               p: 2,
//                               backgroundColor: 'action.hover',
//                             }}
//                           >
//                             {/* TRANSACTION INFO */}
//                             <Card
//                               variant="outlined"
//                               sx={{ mb: 2, borderRadius: 2 }}
//                             >
//                               <CardContent>
//                                 <Typography
//                                   variant="subtitle1"
//                                   fontWeight={700}
//                                   mb={2}
//                                 >
//                                   Transaction Information
//                                 </Typography>

//                                 <Grid container spacing={2}>
//                                   <Grid size={{ xs: 12, md: 4 }}>
//                                     <Typography
//                                       variant="caption"
//                                       color="text.secondary"
//                                     >
//                                       Transaction ID
//                                     </Typography>

//                                     <Typography
//                                       variant="body2"
//                                       fontWeight={600}
//                                       sx={{ wordBreak: 'break-all' }}
//                                     >
//                                       {item.transaction_visitor_id}
//                                     </Typography>
//                                   </Grid>

//                                   <Grid size={{ xs: 12, md: 4 }}>
//                                     <Typography
//                                       variant="caption"
//                                       color="text.secondary"
//                                     >
//                                       Visit Start
//                                     </Typography>

//                                     <Typography variant="body2" fontWeight={600}>
//                                       {formatDateTimeTime(item.visitor_period_start)}
//                                     </Typography>
//                                   </Grid>

//                                   <Grid size={{ xs: 12, md: 4 }}>
//                                     <Typography
//                                       variant="caption"
//                                       color="text.secondary"
//                                     >
//                                       Visit End
//                                     </Typography>

//                                     <Typography variant="body2" fontWeight={600}>
//                                       {item.visitor_period_end === '9999-01-01T00:00:00'
//                                         ? '-'
//                                         : formatDateTimeTime(
//                                           item.visitor_period_end,
//                                           item.extend_visitor_period
//                                         )}
//                                     </Typography>
//                                   </Grid>

//                                   {item.approval_ticket_name && (
//                                     <Grid size={{ xs: 12, md: 6 }}>
//                                       <Typography
//                                         variant="caption"
//                                         color="text.secondary"
//                                       >
//                                         Approval Ticket
//                                       </Typography>

//                                       <Typography
//                                         variant="body2"
//                                         fontWeight={600}
//                                       >
//                                         {item.approval_ticket_name}
//                                       </Typography>
//                                     </Grid>
//                                   )}
//                                 </Grid>
//                               </CardContent>
//                             </Card>

//                             {/* VISITOR DETAILS */}
//                             <Box mb={3}>
//                               <Stack
//                                 direction="row"
//                                 justifyContent="space-between"
//                                 alignItems="center"
//                                 mb={2}
//                               >
//                                 <Typography
//                                   variant="subtitle1"
//                                   fontWeight={700}
//                                 >
//                                   Visitor Details
//                                 </Typography>

//                                 <Chip
//                                   size="small"
//                                   icon={<IconUsers size={15} />}
//                                   label={`${item.data_history_visitor?.length ?? 0} Visitors`}
//                                   variant="outlined"
//                                 />
//                               </Stack>

//                               {item.data_history_visitor?.length ? (
//                                 item.data_history_visitor.map(
//                                   (visitor, index) => (
//                                     <VisitorDetail
//                                       key={`${item.transaction_visitor_id}-${visitor.visitor_code}-${index}`}
//                                       visitor={visitor}
//                                       index={index}
//                                     />
//                                   ),
//                                 )
//                               ) : (
//                                 <Alert severity="info">
//                                   No visitor details available.
//                                 </Alert>
//                               )}
//                             </Box>

//                             {/* TICKET HISTORY */}
//                             {item.data_history_ticket?.length > 0 && (
//                               <Box mb={3}>
//                                 <Typography
//                                   variant="subtitle1"
//                                   fontWeight={700}
//                                   mb={2}
//                                 >
//                                   Approval Ticket History
//                                 </Typography>

//                                 {item.data_history_ticket.map((ticket) => (
//                                   <Card
//                                     key={ticket.ticket_id}
//                                     variant="outlined"
//                                     sx={{ mb: 2, borderRadius: 2 }}
//                                   >
//                                     <CardContent>
//                                       <Stack
//                                         direction={{
//                                           xs: 'column',
//                                           sm: 'row',
//                                         }}
//                                         justifyContent="space-between"
//                                         alignItems={{
//                                           xs: 'flex-start',
//                                           sm: 'center',
//                                         }}
//                                         spacing={1}
//                                         mb={2}
//                                       >
//                                         <Box>
//                                           <Typography fontWeight={700}>
//                                             {ticket.ticket_name}
//                                           </Typography>

//                                           <Typography
//                                             variant="caption"
//                                             color="text.secondary"
//                                           >
//                                             {ticket.workflow_type} • Step{' '}
//                                             {ticket.current_step}
//                                           </Typography>
//                                         </Box>

//                                         <StatusChip
//                                           status={ticket.approval_status}
//                                         />
//                                       </Stack>

//                                       <Divider sx={{ mb: 2 }} />

//                                       <ApprovalActorList
//                                         actors={ticket.actors || []}
//                                       />

//                                       <Typography
//                                         variant="caption"
//                                         color="text.secondary"
//                                       >
//                                         Created: {formatDateTimeTime(ticket.created_at)}
//                                       </Typography>
//                                     </CardContent>
//                                   </Card>
//                                 ))}
//                               </Box>
//                             )}

//                             {/* REJECTION REASONS */}
//                             {item.rejection_reasons?.length > 0 && (
//                               <Alert severity="error">
//                                 <Typography
//                                   fontWeight={700}
//                                   mb={1}
//                                 >
//                                   Rejection Reasons
//                                 </Typography>

//                                 {item.rejection_reasons.map(
//                                   (reason, index) => (
//                                     <Typography
//                                       key={index}
//                                       variant="body2"
//                                     >
//                                       • {String(reason)}
//                                     </Typography>
//                                   ),
//                                 )}
//                               </Alert>
//                             )}
//                           </AccordionDetails>
//                         </Accordion>
//                       ))}
//                     </Stack>
//                   )}
//                 </CardContent>
//               </Card>
//             </>
//           )}
//         </Box>
//       </Container>
//     </PageContainer>
//   );
// };

// export default Content;



import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import Container from 'src/components/container/PageContainer';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import {
  Search,
  Download,
  Refresh,
  PersonOutline,
  AssignmentOutlined,
  History,
  GroupsOutlined,
} from '@mui/icons-material';

import {
  useExportReportApproval,
  useReportApproval,
} from 'src/hooks/Report/useReportApproval';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';
dayjs.extend(utc);
dayjs.extend(timezonePlugin);

// ---------------------------------------------------------
// Types
// ---------------------------------------------------------

type ApprovalActor = {
  approver_name?: string;
  approver_type?: string;
  status?: string;
  approved_at?: string | null;
};

type ApprovalVisitor = {
  agenda?: string;
  visitor_code?: string;
  identity_id?: string;
  visitor_name?: string;
  host_name?: string;
  visitor_period_start?: string;
  visitor_period_end?: string;
  approval_status?: string;
  actors?: ApprovalActor[];
  [key: string]: any;
};

type ApprovalTransaction = {
  transaction_visitor_id?: string;
  agenda?: string;
  workflow_type?: string;
  approval_ticket_name?: string;
  current_step?: string | number;
  visitor_period_start?: string;
  visitor_period_end?: string;
  visitor_total?: number;
  host_name?: string;
  approval_status?: string;
  rejection_reasons?: string;
  data_history_ticket?: any[];
  data_history_visitor?: any[];
  visitors?: ApprovalVisitor[];
  [key: string]: any;
};

type ApprovalReportResponse = {
  collection?: {
    by_transaction_visitor?: {
      summary_total?: {
        pending?: number;
        approved?: number;
        rejected?: number;
      };
      data_visitor?: ApprovalTransaction[];
    };
  };
};

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const getStatusColor = (status?: string) => {
  switch ((status ?? '').toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const formatStatus = (status?: string) => {
  if (!status) return 'Unknown';

  return status.charAt(0).toUpperCase() +
    status.slice(1).toLowerCase();
};



const getInitial = (name?: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
};

const getTransactionName = (item: ApprovalTransaction) => {
  return (
    item.approval_ticket_name ||
    item.agenda ||
    item.transaction_visitor_id ||
    'Approval Transaction'
  );
};

const getVisitors = (
  item?: ApprovalTransaction | null,
): ApprovalVisitor[] => {
  if (!item) return [];

  return item.data_history_visitor ?? [];
};

// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------

const ApprovalReport = () => {
  const today = dayjs().format('YYYY-MM-DD');

  const defaultStartDate = dayjs()
    .subtract(7, 'day')
    .format('YYYY-MM-DD');

  const timezone = dayjs.tz.guess();

  // Filters: only 3 fields
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);
  const [actorId, setActorId] = useState('');

  // Report
  const [report, setReport] =
    useState<ApprovalReportResponse | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<ApprovalTransaction | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Local search for result list only
  const [searchResult, setSearchResult] = useState('');

  const {
    mutateAsync: generateReport,
    isPending: loadingGenerate,
  } = useReportApproval();

  const {
    mutateAsync: exportReport,
    isPending: loadingExport,
  } = useExportReportApproval();

  const loading = loadingGenerate || loadingExport;

  // -------------------------------------------------------
  // API
  // -------------------------------------------------------

  const handleSearch = async (isExport = false) => {
    if (!startDate || !endDate) {
      window.alert('Please select start date and end date.');
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), 'day')) {
      window.alert('End date cannot be earlier than start date.');
      return;
    }

    // const startDateUtc = dayjs
    //   .tz(startDate, timezone)
    //   .startOf('day')
    //   .utc()
    //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

    // const endDateUtc = dayjs
    //   .tz(endDate, timezone)
    //   .endOf('day')
    //   .utc()
    //   .format('YYYY-MM-DDTHH:mm:ss[Z]');

    const payload = {
      start_date: startDate,
      end_date: endDate,
      timezone,
      is_export: isExport,
      export_report: 'Excell',
      actor_id: actorId || null,
    };

    try {
      if (isExport) {
        const response = await exportReport(payload);

        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download =
          `approval-report-${startDate}-${endDate}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        return;
      }

      const response = await generateReport(payload);

      setReport(response);

      const transactions =
        response?.collection?.by_transaction_visitor?.data_visitor ?? [];

      setSelectedTransaction(transactions[0] ?? null);
      setSearchResult('');
      setActiveTab(0);
      setHasGenerated(true);
    } catch (error) {
      console.error('Approval report error:', error);

      window.alert(
        isExport
          ? 'Failed to export approval report.'
          : 'Failed to generate approval report.',
      );
    }
  };

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setEndDate(today);
    setActorId('');
    setSearchResult('');

    setReport(null);
    setSelectedTransaction(null);
    setHasGenerated(false);
    setActiveTab(0);
  };

  // -------------------------------------------------------
  // Report Data
  // -------------------------------------------------------

  const approvalData =
    report?.collection?.by_transaction_visitor;

  const summary = approvalData?.summary_total ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const transactions = approvalData?.data_visitor ?? [];

  const filteredTransactions = useMemo(() => {
    const keyword = searchResult.toLowerCase().trim();

    if (!keyword) return transactions;

    return transactions.filter((item) => {
      const searchableValues = [
        item.agenda,
        item.approval_ticket_name,
        item.host_name,
        item.transaction_visitor_id,
        item.workflow_type,
      ];

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(keyword),
      );
    });
  }, [transactions, searchResult]);

  const selectedVisitors = useMemo(
    () => getVisitors(selectedTransaction),
    [selectedTransaction],
  );

  const visitorCount =
    selectedTransaction?.visitor_total ??
    selectedVisitors.length;

  // -------------------------------------------------------
  // Reusable Components
  // -------------------------------------------------------

  const StatusChip = ({
    status,
  }: {
    status?: string;
  }) => (
    <Chip
      size="small"
      color={getStatusColor(status) as any}
      label={formatStatus(status)}
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
      }}
    />
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: any;
  }) => (
    <Grid container spacing={1} sx={{ mb: 1.3 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>

      <Grid item xs={8}>
        <Typography variant="body2" fontWeight={500}>
          {value === null ||
            value === undefined ||
            value === ''
            ? '-'
            : value}
        </Typography>
      </Grid>
    </Grid>
  );

  const SectionCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Box>

      <CardContent>{children}</CardContent>
    </Card>
  );

  // -------------------------------------------------------
  // Overview
  // -------------------------------------------------------

  const renderOverview = () => {
    if (!selectedTransaction) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Approval Information">
            <InfoRow
              label="Approval Ticket"
              value={selectedTransaction.approval_ticket_name}
            />

            <InfoRow
              label="Agenda"
              value={selectedTransaction.agenda}
            />

            <InfoRow
              label="Workflow Type"
              value={selectedTransaction.workflow_type}
            />

            <InfoRow
              label="Current Step"
              value={selectedTransaction.current_step}
            />

            <InfoRow
              label="Host"
              value={selectedTransaction.host_name}
            />

            <InfoRow
              label="Total Visitors"
              value={visitorCount}
            />

            <InfoRow
              label="Visit Start"
              value={formatDateTime(
                selectedTransaction.visitor_period_start,
              )}
            />

            <InfoRow
              label="Visit End"
              value={formatDateTime(
                selectedTransaction.visitor_period_end,
              )}
            />

            <InfoRow
              label="Status"
              value={
                <StatusChip
                  status={selectedTransaction.approval_status}
                />
              }
            />

            {selectedTransaction.rejection_reasons && (
              <InfoRow
                label="Rejection Reason"
                value={selectedTransaction.rejection_reasons}
              />
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Approval Summary">
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'warning.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Pending
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.pending ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'success.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Approved
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.approved ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'error.lighter',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    Rejected
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {summary.rejected ?? 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Approval Progress">
            {selectedVisitors.length > 0 ? (
              <Stack spacing={2}>
                {selectedVisitors.map((visitor, index) => (
                  <Box key={visitor.visitor_code ?? index}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {visitor.visitor_name ?? 'Visitor'}
                      </Typography>

                      <StatusChip status={visitor.approval_status} />
                    </Stack>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Visitor Code
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {visitor.visitor_code ?? '-'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No visitor details available.
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    );
  };

  // -------------------------------------------------------
  // Visitors
  // -------------------------------------------------------

  const renderVisitors = () => (
    <SectionCard title={`Visitors (${selectedVisitors.length})`}>
      {selectedVisitors.length > 0 ? (
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 700 }}>
            <Grid
              container
              sx={{
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {[
                'Visitor',
                'Visitor Code',
                'Host',
                'Visit Start',
                'Visit End',
                'Status',
              ].map((title) => (
                <Grid item xs={2} key={title}>
                  <Typography variant="caption" fontWeight={700}>
                    {title}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {selectedVisitors.map((visitor, index) => (
              <Grid
                container
                key={visitor.visitor_code ?? index}
                alignItems="center"
                sx={{
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Grid item xs={2}>
                  <Typography variant="body2" fontWeight={600}>
                    {visitor.visitor_name ?? '-'}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {visitor.identity_id ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {visitor.visitor_code ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {visitor.host_name ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {formatDateTime(visitor.visitor_period_start)}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <Typography variant="body2">
                    {formatDateTime(visitor.visitor_period_end)}
                  </Typography>
                </Grid>

                <Grid item xs={2}>
                  <StatusChip status={visitor.approval_status} />
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary" variant="body2">
          No visitor data available.
        </Typography>
      )}
    </SectionCard>
  );

  // -------------------------------------------------------
  // Approval History
  // -------------------------------------------------------

  const renderApprovalHistory = () => {
    if (!selectedTransaction) return null;

    const ticketHistory =
      selectedTransaction.data_history_ticket ?? [];

    const visitorHistory =
      selectedTransaction.data_history_visitor ?? [];

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Ticket Approval History">
            {ticketHistory.length > 0 ? (
              <Stack spacing={2}>
                {ticketHistory.map((history, index) => (
                  <Box key={history.id ?? index}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.light',
                          fontSize: 13,
                        }}
                      >
                        {getInitial(
                          history.approver_name ??
                          history.actor_name,
                        )}
                      </Avatar>

                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {history.approver_name ??
                            history.actor_name ??
                            'Approval Actor'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {history.approver_type ??
                            history.actor_type ??
                            '-'}
                        </Typography>
                      </Box>

                      <StatusChip
                        status={
                          history.status ??
                          history.approval_status
                        }
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 5 }}
                    >
                      {formatDateTime(
                        history.approved_at ??
                        history.created_at,
                      )}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No ticket approval history available.
              </Typography>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Visitor Approval History">
            {visitorHistory.length > 0 ? (
              <Stack spacing={2}>
                {visitorHistory.map((history, index) => (
                  <Box key={history.id ?? index}>
                    <Typography variant="body2" fontWeight={600}>
                      {history.visitor_name ??
                        history.visitor_code ??
                        'Visitor'}
                    </Typography>

                    {(history.actors ?? []).map(
                      (actor: ApprovalActor, actorIndex: number) => (
                        <Box
                          key={actorIndex}
                          sx={{ mt: 1, ml: 1 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: 11,
                              }}
                            >
                              {getInitial(actor.approver_name)}
                            </Avatar>

                            <Box flex={1}>
                              <Typography variant="body2">
                                {actor.approver_name ?? '-'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {actor.approver_type ?? '-'}
                              </Typography>
                            </Box>

                            <StatusChip status={actor.status} />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 4.5 }}
                          >
                            {formatDateTime(actor.approved_at)}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No visitor approval history available.
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    );
  };

  // -------------------------------------------------------
  // Main UI
  // -------------------------------------------------------

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Report" description="This is Content Report page">
        <Box sx={{ p: 1.5 }}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            mb={2}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eef5ff',
                color: '#1976d2',
              }}
            >
              <Search />
            </Box>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                Approval Investigation
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Search and investigate visitor approval transactions and histories.
              </Typography>
            </Box>
          </Stack>

          {/* Filter */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Tabs
              value={0}
              sx={{
                mb: 2,
                minHeight: 40,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 40,
                  textTransform: 'none',
                },
              }}
            >
              <Tab
                icon={<AssignmentOutlined />}
                iconPosition="start"
                label="Approval Investigation"
              />
            </Tabs>

            <Grid container spacing={1.5}>
              {/* Start Date */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} mb={0.7}>
                  Start Date *
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} mb={0.7}>
                  End Date *
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Actor ID */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" fontWeight={600} mb={0.7}>
                  Actor ID
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search actor ID..."
                  value={actorId}
                  onChange={(event) =>
                    setActorId(event.target.value)
                  }
                />
              </Grid>

              {/* Actions */}
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={1}
                mt={1}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    loadingExport
                      ? <CircularProgress size={16} color="inherit" />
                      : <Download />
                  }
                  onClick={() => handleSearch(true)}
                  disabled={loading}
                >
                  Export Excel
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    loadingGenerate
                      ? <CircularProgress size={16} color="inherit" />
                      : <Search />
                  }
                  onClick={() => handleSearch(false)}
                  disabled={loading}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results */}
          {!hasGenerated ? (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                textAlign: 'center',
                borderStyle: 'dashed',
              }}
            >
              <Search
                color="disabled"
                sx={{ fontSize: 40, mb: 1 }}
              />

              <Typography variant="h6">
                No Approval Data
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Select your filters and click Search to investigate approval records.
              </Typography>
            </Paper>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Grid container sx={{ minHeight: 550 }}>
                {/* Left Panel */}
                <Grid
                  item
                  xs={12}
                  md={3}
                  sx={{
                    borderRight: { md: 1 },
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ p: 1.5 }}>
                    <Typography fontWeight={700} mb={1}>
                      Search Results ({filteredTransactions.length})
                    </Typography>

                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search approval..."
                      value={searchResult}
                      onChange={(event) =>
                        setSearchResult(event.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Stack
                      direction="row"
                      spacing={0.7}
                      flexWrap="wrap"
                      useFlexGap
                      mt={1.5}
                      mb={1.5}
                    >
                      <Chip
                        size="small"
                        label={`Pending ${summary.pending ?? 0}`}
                        color="warning"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={`Approved ${summary.approved ?? 0}`}
                        color="success"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={`Rejected ${summary.rejected ?? 0}`}
                        color="error"
                        variant="outlined"
                      />
                    </Stack>

                    <Divider sx={{ mb: 1 }} />

                    <Box
                      sx={{
                        maxHeight: 650,
                        overflowY: 'auto',
                        pr: 0.5,
                      }}
                    >
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item, index) => {
                          const isSelected =
                            selectedTransaction?.transaction_visitor_id ===
                            item.transaction_visitor_id;

                          return (
                            <Box
                              key={
                                item.transaction_visitor_id ?? index
                              }
                              onClick={() => {
                                setSelectedTransaction(item);
                                setActiveTab(0);
                              }}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                border: 1,
                                borderColor: isSelected
                                  ? 'primary.main'
                                  : 'transparent',
                                bgcolor: isSelected
                                  ? 'primary.lighter'
                                  : 'transparent',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    bgcolor: 'primary.light',
                                    color: 'primary.dark',
                                  }}
                                >
                                  {getInitial(
                                    getTransactionName(item),
                                  )}
                                </Avatar>

                                <Box flex={1} minWidth={0}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    noWrap
                                  >
                                    {getTransactionName(item)}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    display="block"
                                  >
                                    {item.host_name ?? '-'}
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.7}
                                    mt={0.7}
                                  >
                                    <StatusChip
                                      status={item.approval_status}
                                    />

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {item.total_visitor ?? 0} visitors
                                    </Typography>
                                  </Stack>
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          py={4}
                        >
                          No approval records found.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Right Panel */}
                <Grid item xs={12} md={9}>
                  {selectedTransaction ? (
                    <Box>
                      {/* Selected Header */}
                      <Box sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 46,
                              height: 46,
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                            }}
                          >
                            {getInitial(
                              getTransactionName(selectedTransaction),
                            )}
                          </Avatar>

                          <Box flex={1} minWidth={0}>
                            <Typography variant="h6" fontWeight={700}>
                              {getTransactionName(selectedTransaction)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {selectedTransaction.host_name ?? '-'}
                            </Typography>
                          </Box>

                          <StatusChip
                            status={selectedTransaction.approval_status}
                          />
                        </Stack>
                      </Box>

                      <Divider />

                      {/* Detail Tabs */}
                      <Tabs
                        value={activeTab}
                        onChange={(_, value) => setActiveTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          px: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 46,
                          },
                        }}
                      >
                        <Tab
                          icon={<PersonOutline />}
                          iconPosition="start"
                          label="Overview"
                        />

                        <Tab
                          icon={<GroupsOutlined />}
                          iconPosition="start"
                          label={`Visitors (${visitorCount})`}
                        />

                        <Tab
                          icon={<History />}
                          iconPosition="start"
                          label="Approval History"
                        />
                      </Tabs>

                      {/* Tab Content */}
                      <Box sx={{ p: 2 }}>
                        {activeTab === 0 && renderOverview()}
                        {activeTab === 1 && renderVisitors()}
                        {activeTab === 2 && renderApprovalHistory()}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        minHeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        Select an approval transaction to view details.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ApprovalReport;
