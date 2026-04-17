import moment from 'moment';
import { axiosInstance2 } from 'src/customs/api/interceptor';
import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  CardContent,
  Grid2,
  Typography,
  Tooltip,
  Skeleton,
  Fab,
  InputAdornment,
  Drawer,
  Tab,
  Tabs,
  TablePagination,
  IconButton,
  Switch,
  Breadcrumbs,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  IconAlertSquare,
  IconArrowAutofitLeft,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconFileExport,
  IconFileSpreadsheet,
  IconFileText,
  IconFileTypePdf,
  IconForbid2,
  IconHome,
  IconKeyOff,
  IconLogin2,
  IconLogout2,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconUserCheck,
  IconUserFilled,
  IconUserX,
  IconX,
  IconXboxX,
} from '@tabler/icons-react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IconStarFilled } from '@tabler/icons-react';
import { GroupRoleId } from 'src/constant/GroupRoleId';
import RichHtmlCell from './RichHtmlCell';

export const TableBodyContent = ({
  loading,
  rowsPerPage,
  isHaveChecked,
  isHaveAction,
  isActionVisitor,
  paginatedData,
  columns,
  checkedIds,
  handleCheckRow,
  isTreeSiteType,
  toggleRow,
  openRow,
  page,
  isActionEmployee,
  isHaveVip,
  htmlFields,
  htmlClampLines,
  htmlMaxWidth,
  isAccessControlType,
  isHavePeriod,
  isHaveEmployee,
  isHaveGender,
  isSiteSpaceType,
  isHaveImage,
  imageFields,
  isDataVerified,
  tooltipLabels,
  isHavePdf,
  onFileClick,
  isHaveVerified,
  visiblePasswords,
  togglePassword,
  isHavePassword,
  isHaveCard,
  isHaveBooleanSwitch,
  onBooleanSwitchChange,
  isHaveObjectData,
  objectFields,
  isHaveIntegration,
  onNameClick,
  isHaveApproval,
  onAccept,
  onDenied,
  isHaveAccess,
  getAccessActions,
  isHaveView,
  onView,
  onEdit,
  isHavePermission,
  onPermission,
  isHaveViewAndAction,
  isBlacklistAction,
  onBlacklist,
  isActionListVisitor,
  isHaveSettingOperator,
  onSettingOperator,
  isHaveActionRevoke,
  onActionRevoke,
  isHaveActionOnlyEdit,
  isSelectedType,
  isButtonGiveAccess,
  isButtonRegisteredSite,
  isButtonSiteAccess,
  onGiveAccess,
  onRegisteredSite,
  onEmployeeClick,
  onSiteAccess,
  isCopyLink,
  onCopyLink,
  onDetailLink,
  isButtonEnabled,
  isButtonDisabled,
  onIsButtonDisabled,
  isHaveVisitor,
  // CHECKBOX_COL_WIDTH,
  // ACTION_COL_WIDTH,
  // INDEX_COL_WIDTH,
  onDelete,
}: any) => {
  const GENDER_MAP: Record<string, string> = {
    '0': 'Female',
    '1': 'Male',
    '2': 'Prefer not to say',
  };

  const SITE_MAP: Record<number, string> = {
    0: 'Site',
    1: 'Building',
    2: 'Floor',
    3: 'Room',
  };

  const formatDate = (date?: string) => {
    if (!date) return '-'; // fallback kalau kosong
    return moment.utc(date).local().format('DD-MM-YYYY, HH:mm');
  };

  const CARD_STATUS: Record<number, string> = {
    0: 'Not Found',
    1: 'Active',
    2: 'Lost',
    3: 'Broken',
    4: 'Not Return',
  };

  const DOCUMENT_TYPE: Record<number, string> = {
    0: 'Card',
    1: 'Document',
    2: 'Face',
  };
  const BASE_URL = axiosInstance2.defaults.baseURL + '/cdn';

  const CHECKBOX_COL_WIDTH = 40;
  const ACTION_COL_WIDTH = 105;
  const INDEX_COL_WIDTH = 56;
  const DATA_COL_WIDTH = 180;
  const STICKY_DATA_COUNT = 2;

  const getLeftBase = () =>
    (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
    (isActionVisitor ? ACTION_COL_WIDTH : 0) +
    INDEX_COL_WIDTH;
  const getStickyLeft = (i: number) => getLeftBase() + i * DATA_COL_WIDTH;

  const isStickyVisitorCol = (i: number) => isHaveVisitor && i < STICKY_DATA_COUNT;
  const statusBgMap: Record<string, string> = {
    Checkin: '#21c45d', // hijau
    Checkout: '#F44336', // merah
    Block: '#000000', // hitam
    Deny: '#8B0000', // merah tua
    Approve: '#21c45d', // hijau
    Pracheckin: '#21c45d', // hijau
  };

  const defaultBg = '#9E9E9E'; // abu-abu

  const skeletonCount = rowsPerPage === -1 ? 10 : rowsPerPage;
  return (
    <>
      <TableBody>
        {loading ? (
          [...Array(skeletonCount)].map((_, idx) => (
            <TableRow key={`skeleton-${idx}`}>
              {isHaveChecked && (
                <TableCell
                  padding="checkbox"
                  align="center"
                  sx={{
                    position: 'sticky',
                    background: 'white',
                    zIndex: 2,
                    padding: 2,
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    height: '100%',
                  }}
                >
                  <Skeleton variant="rectangular" width={20} height={20} animation="wave" />
                </TableCell>
              )}

              {isHaveAction && isActionVisitor && (
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
                    background: 'white',
                    zIndex: 2,
                    width: ACTION_COL_WIDTH,
                  }}
                >
                  <Box display="flex" gap={0.5} justifyContent="center">
                    {[...Array(3)].map((__, j) => (
                      <Skeleton
                        key={j}
                        variant="rectangular"
                        width={28}
                        height={28}
                        animation="wave"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                </TableCell>
              )}

              {/* ✅ Index (No) */}
              <TableCell
                sx={{
                  position: 'sticky',
                  left:
                    (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
                    (isActionVisitor ? ACTION_COL_WIDTH : 0),
                  background: 'white',
                  zIndex: 1,
                  width: INDEX_COL_WIDTH,
                }}
              >
                <Skeleton variant="text" width="30%" height={18} animation="wave" />
              </TableCell>

              {/* ✅ Main data columns */}
              {columns.map((col: any, i: any) => (
                <TableCell key={i}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {/* Skeleton type by column name */}
                    {col.includes('image') || col.includes('avatar') ? (
                      <>
                        <Skeleton variant="circular" width={32} height={32} animation="wave" />
                      </>
                    ) : col.includes('status') ? (
                      <Skeleton
                        variant="rectangular"
                        width={60}
                        height={24}
                        sx={{ borderRadius: 1 }}
                        animation="wave"
                      />
                    ) : (
                      <Skeleton
                        variant="text"
                        width={`${40 + Math.random() * 40}%`}
                        height={18}
                        animation="wave"
                      />
                    )}
                  </Box>
                </TableCell>
              ))}
              {isHaveAction && !isActionVisitor && (
                <TableCell
                  align="center"
                  sx={{ position: 'sticky', right: 0, background: 'white', zIndex: 2 }}
                >
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    {[...Array(3)].map((__, j) => (
                      <Skeleton
                        key={j}
                        variant="rectangular"
                        width={28}
                        height={28}
                        animation="wave"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))
        ) : paginatedData.length === 0 && !loading ? (
          <></>
        ) : (
          paginatedData.map((row: any, index: any) => (
            // <TableRow key={row.id}>
            //   {isHaveChecked && (
            //     <TableCell
            //       padding="checkbox"
            //       sx={{ position: 'sticky', left: 0, zIndex: 3, background: 'white' }}
            //     >
            //       <Checkbox
            //         checked={checkedIds.includes(row.id)}
            //         onChange={(e) => handleCheckRow(row.id as string, e.target.checked)}
            //       />
            //     </TableCell>
            //   )}

            //   {isTreeSiteType && (
            //     <TableCell width={50}>
            //       <IconButton size="small" onClick={() => toggleRow(row.id)}>
            //         {openRow === row.id ? <ExpandLess /> : <ExpandMore />}
            //       </IconButton>
            //     </TableCell>
            //   )}

            //   {isHaveAction && isActionVisitor && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
            //         zIndex: 3,
            //         background: 'white',
            //         minWidth: ACTION_COL_WIDTH,
            //         maxWidth: ACTION_COL_WIDTH,
            //       }}
            //     >
            //       <Box display="flex" alignItems="center" gap={0.3} justifyContent={'center'}>
            //         {/* Detail Visitor */}
            //         <Tooltip title="Detail Visitor">
            //           <IconButton
            //             onClick={() => onView?.(row)}
            //             disableRipple
            //             sx={{
            //               color: 'white',
            //               backgroundColor: 'gray !important',
            //               width: 28,
            //               height: 28,
            //               padding: 0.5,
            //               borderRadius: '50%',
            //               '&:hover': {
            //                 backgroundColor: 'success.dark',
            //                 color: 'white',
            //               },
            //             }}
            //           >
            //             <RemoveRedEyeIcon width={18} height={18} />
            //           </IconButton>
            //         </Tooltip>
            //         {isActionEmployee == false && (
            //           <>
            //             {/* Tombol Checkin */}
            //             <Tooltip title="Check In">
            //               <IconButton
            //                 onClick={() => onEdit?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: '#13DEB9 !important',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'success.dark',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconLogin2 width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>

            //             {/* Tombol Checkout */}
            //             <Tooltip title="Check Out">
            //               <IconButton
            //                 onClick={() => onDelete?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'error.main',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'error.dark',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconLogout2 width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>
            //           </>
            //         )}
            //       </Box>
            //     </TableCell>
            //   )}

            //   <TableCell
            //     sx={{
            //       position: { xs: 'static', lg: 'sticky' },
            //       left:
            //         (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
            //         (isActionVisitor ? ACTION_COL_WIDTH : 0),
            //       zIndex: 3,
            //       background: 'white',
            //       minWidth: INDEX_COL_WIDTH,
            //       maxWidth: INDEX_COL_WIDTH,
            //       fontSize: '0.85rem !important',
            //     }}
            //   >
            //     {index + 1 + page * rowsPerPage}
            //   </TableCell>

            //   {columns.map((col: any, idx: any) => {
            //     const makeSticky = isStickyVisitorCol(idx);

            //     return (
            //       <TableCell
            //         key={col}
            //         sx={{
            //           ...(makeSticky && {
            //             position: { xs: 'static', lg: 'sticky' },
            //             left: getStickyLeft(idx),
            //             zIndex: 3,
            //             background: 'white',
            //             minWidth: DATA_COL_WIDTH,
            //             maxWidth: DATA_COL_WIDTH,
            //           }),
            //           fontSize: '0.85rem !important',
            //         }}
            //       >
            //         {isHaveVip && col === 'is_vip' ? (
            //           row[col] ? (
            //             <Tooltip title="VIP">
            //               <IconStarFilled color="gold" />
            //             </Tooltip>
            //           ) : (
            //             <Tooltip title="Not VIP">
            //               <IconStarFilled color="lightgray" />
            //             </Tooltip>
            //           )
            //         ) : htmlFields.includes(col) && typeof row[col] === 'string' ? (
            //           <RichHtmlCell
            //             html={String(row[col] ?? '')}
            //             lines={htmlClampLines}
            //             maxWidth={htmlMaxWidth}
            //           />
            //         ) : col === 'type' && isAccessControlType ? (
            //           <>{row.type === 0 ? 'Access' : 'Group'}</>
            //         ) : col === 'card_status' ? (
            //           (CARD_STATUS[Number(row[col])] ?? String(row[col] ?? '-'))
            //         ) : col === 'is_employee' ? (
            //           row[col] ? (
            //             <IconUserCheck size={20} color="green" />
            //           ) : (
            //             <IconUserX size={20} color="red" />
            //           )
            //         ) : col === 'visitor_status' ? (
            //           <Box
            //             sx={{
            //               backgroundColor: statusBgMap[row.visitor_status] || defaultBg,
            //               borderRadius: '999px',
            //               color: '#fff',
            //               px: 1.5,
            //               py: 0.5,
            //               display: 'inline-flex',
            //               alignItems: 'center',
            //               justifyContent: 'center',
            //               fontSize: '0.75rem',
            //               fontWeight: 600,
            //               whiteSpace: 'nowrap',
            //             }}
            //           >
            //             {row.visitor_status || '-'}
            //           </Box>
            //         ) : col === 'document_type' ? (
            //           (DOCUMENT_TYPE[Number(row[col])] ?? String(row[col] ?? '-'))
            //         ) : col === 'status' && isHaveApproval ? (
            //           row[col] === 'Accept' ? (
            //             <Typography
            //               sx={{
            //                 color: 'success.main',
            //                 fontWeight: 400,
            //                 backgroundColor: 'success.light',
            //                 textAlign: 'center',
            //                 padding: 0.5,
            //                 borderRadius: '8px',
            //                 width: '100px',
            //               }}
            //               variant="body2"
            //             >
            //               Accept
            //             </Typography>
            //           ) : row[col] === 'Deny' ? (
            //             <Typography
            //               sx={{
            //                 color: 'error.main',
            //                 fontWeight: 400,
            //                 backgroundColor: 'error.light',
            //                 textAlign: 'center',
            //                 padding: 0.5,
            //                 borderRadius: '8px',
            //                 width: '100px',
            //               }}
            //               variant="body2"
            //             >
            //               Deny
            //             </Typography>
            //           ) : (
            //             <>
            //               <Typography
            //                 sx={{
            //                   color: '#fff',
            //                   fontWeight: 400,
            //                   backgroundColor: 'grey',
            //                   textAlign: 'center',
            //                   padding: 0.5,
            //                   borderRadius: '8px',
            //                   width: '100px',
            //                 }}
            //                 variant="body2"
            //               >
            //                 Pending
            //               </Typography>
            //             </>
            //           )
            //         ) : isHavePeriod && col === 'visitor_period_start' ? (
            //           <>
            //             {formatDate(row[col] as string)}
            //             <br />
            //           </>
            //         ) : isHaveEmployee && col === 'host' ? (
            //           <Tooltip title="View Host">
            //             <IconButton
            //               size="small"
            //               color="primary"
            //               onClick={() => onEmployeeClick?.(row)}
            //               sx={{
            //                 borderRadius: '50%',
            //                 width: 30,
            //                 height: 30,
            //                 backgroundColor: (theme) => theme.palette.grey[100],
            //               }}
            //             >
            //               <IconUserFilled />
            //             </IconButton>
            //           </Tooltip>
            //         ) : col === 'employee' ? (
            //           <>
            //             {row.employee && (
            //               <Tooltip title="You are the host">
            //                 <IconStarFilled color="gold" size={24} style={{ color: 'gold' }} />
            //               </Tooltip>
            //             )}
            //           </>
            //         ) : isHaveGender && col === 'gender' ? (
            //           (GENDER_MAP[String(row[col])] ?? String(row[col] ?? '-'))
            //         ) : isSiteSpaceType && col === 'type' ? (
            //           (SITE_MAP[Number(row[col])] ?? String(row[col] ?? '-'))
            //         ) : isHaveImage &&
            //           imageFields.includes(col) &&
            //           typeof row[col] === 'string' &&
            //           row[col].trim() !== '' ? (
            //           <img
            //             loading="lazy"
            //             src={(() => {
            //               const value = row[col];
            //               if (value.startsWith('data:image')) return value;
            //               if (value.startsWith('http')) return value;
            //               return `${BASE_URL}${value}`;
            //             })()}
            //             style={{
            //               width: 60,
            //               height: 60,
            //               borderRadius: '50%',
            //               objectFit: 'cover',
            //             }}
            //           />
            //         ) : isHaveImage && imageFields.includes(col) ? (
            //           <>-</>
            //         ) : (isDataVerified && col === 'secure') ||
            //           col === 'can_upload' ||
            //           col === 'can_signed' ||
            //           col === 'can_declined' ||
            //           col === 'is_primary' ||
            //           col === 'is_employee_used' ||
            //           col === 'is_multi_site' ||
            //           col === 'is_used' ||
            //           col === 'link_status' ||
            //           col === 'is_active' ||
            //           col === 'early_access' ? (
            //           <Box display="flex" alignItems="center" justifyContent="start" width="100%">
            //             <Tooltip
            //               title={
            //                 row[col]
            //                   ? (tooltipLabels[col]?.true ?? 'Verified')
            //                   : (tooltipLabels[col]?.false ?? 'Not Verified')
            //               }
            //             >
            //               <Box
            //                 sx={(theme) => ({
            //                   backgroundColor: row[col]
            //                     ? theme.palette.success.main
            //                     : theme.palette.error.main,
            //                   borderRadius: '50%',
            //                   display: 'inline-flex',
            //                   alignItems: 'center',
            //                   justifyContent: 'center',
            //                   p: '2px',
            //                 })}
            //               >
            //                 {row[col] ? (
            //                   <IconCheck color="white" size={16} />
            //                 ) : (
            //                   <IconX color="white" size={16} />
            //                 )}
            //               </Box>
            //             </Tooltip>
            //           </Box>
            //         ) : isHavePdf && col === 'file' ? (
            //           <Tooltip title="View File">
            //             <IconButton
            //               size="small"
            //               color="primary"
            //               onClick={() => onFileClick?.(row)}
            //               sx={{
            //                 borderRadius: '50%',
            //                 width: 30,
            //                 height: 30,
            //                 backgroundColor: (theme) => theme.palette.grey[100],
            //               }}
            //             >
            //               <IconFileText />
            //             </IconButton>
            //           </Tooltip>
            //         ) : col === 'email' ? (
            //           <Box
            //             display="inline-flex"
            //             alignItems="center"
            //             justifyContent="start"
            //             textAlign={'left'}
            //             gap={0.5}
            //             width="100%"
            //             sx={{
            //               wordBreak: 'break-word',
            //               whiteSpace: 'normal',
            //             }}
            //           >
            //             <span>{(row[col] as React.ReactNode) ?? '-'}</span>

            //             {isHaveVerified &&
            //               (row.is_email_verified ? (
            //                 <Tooltip title="Email Verified">
            //                   <Box
            //                     sx={{
            //                       backgroundColor: '#13DEB9',
            //                       borderRadius: '50%',
            //                       display: 'inline-flex',
            //                       alignItems: 'center',
            //                       justifyContent: 'center',
            //                       padding: '1px',
            //                     }}
            //                   >
            //                     <IconCheck color="white" size={16} />
            //                   </Box>
            //                 </Tooltip>
            //               ) : (
            //                 <Tooltip title="Email Not Verified">
            //                   <Box
            //                     sx={{
            //                       backgroundColor: 'red',
            //                       borderRadius: '50%',
            //                       display: 'inline-flex',
            //                       alignItems: 'center',
            //                       justifyContent: 'center',
            //                       padding: '1px',
            //                     }}
            //                   >
            //                     <IconX color="white" size={16} />
            //                   </Box>
            //                 </Tooltip>
            //               ))}
            //           </Box>
            //         ) : col === 'password' ? (
            //           <Box
            //             display="inline-flex"
            //             alignItems="center"
            //             gap={0.5}
            //             justifyContent={'start'}
            //             width="100%"
            //           >
            //             {isHavePassword ? (
            //               visiblePasswords[row.id] ? (
            //                 <>
            //                   <span>{String(row[col] ?? '-')}</span>
            //                   <Tooltip title="Hide Password">
            //                     <IconButton
            //                       size="small"
            //                       onClick={(e) => {
            //                         e.stopPropagation();
            //                         togglePassword(row.id);
            //                       }}
            //                     >
            //                       <IconEyeOff size={18} />
            //                     </IconButton>
            //                   </Tooltip>
            //                 </>
            //               ) : (
            //                 <Tooltip title="Show Password">
            //                   <IconButton
            //                     size="small"
            //                     onClick={(e) => {
            //                       e.stopPropagation();
            //                       togglePassword(row.id);
            //                     }}
            //                     sx={{
            //                       bgcolor: 'grey.200',
            //                       '&:hover': {
            //                         bgcolor: 'grey.300',
            //                       },
            //                       borderRadius: '50%',
            //                       p: 0.5,
            //                     }}
            //                   >
            //                     <IconEye size={18} />
            //                   </IconButton>
            //                 </Tooltip>
            //               )
            //             ) : (
            //               '••••••••'
            //             )}
            //           </Box>
            //         ) : isHaveCard && col === 'card' ? (
            //           row[col] ? (
            //             <>{row[col]}</>
            //           ) : (
            //             <>-</>
            //           )
            //         ) : col === 'is_blacklist' ? (
            //           <>
            //             <Box
            //               sx={(theme) => ({
            //                 backgroundColor: row[col]
            //                   ? theme.palette.success.main
            //                   : theme.palette.error.main,
            //                 borderRadius: '50%',
            //                 display: 'inline-flex',
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 p: '2px',
            //               })}
            //             >
            //               {row[col] ? (
            //                 <Tooltip title="Blacklist" arrow>
            //                   <IconCheck color="white" size={18} />
            //                 </Tooltip>
            //               ) : (
            //                 <Tooltip title="Not Blacklist" arrow>
            //                   <IconX color="white" size={16} />
            //                 </Tooltip>
            //               )}
            //             </Box>
            //           </>
            //         ) : isHaveBooleanSwitch && typeof row[col] === 'boolean' ? (
            //           <Box
            //             display="flex"
            //             alignItems="center"
            //             width={'100%'}
            //             justifyContent={'center'}
            //           >
            //             <Switch
            //               checked={row[col] as boolean}
            //               onChange={(_, checked) => onBooleanSwitchChange?.(row.id, col, checked)}
            //               color="primary"
            //               size="small"
            //             />
            //           </Box>
            //         ) : isHaveObjectData &&
            //           objectFields?.includes(col) &&
            //           typeof row[col] === 'object' &&
            //           row[col] !== null ? (
            //           Array.isArray(row[col]) ? (
            //             row[col].map((item: any) => item.name).join(', ')
            //           ) : (
            //             ((row[col] as { name?: string }).name ?? '-')
            //           )
            //         ) : (
            //           <>
            //             {isHaveIntegration && col === 'name' && onNameClick ? (
            //               <Button
            //                 variant="text"
            //                 size="small"
            //                 onClick={() => {
            //                   // e.stopPropagation();
            //                   onNameClick?.(row);
            //                 }}
            //                 sx={{
            //                   p: 1,
            //                   minWidth: 0,
            //                   textTransform: 'none',
            //                   fontSize: '0.875rem',
            //                   textDecoration: 'underline',
            //                 }}
            //                 // target="_blank"
            //               >
            //                 {String(row[col] ?? '-')}
            //               </Button>
            //             ) : (
            //               String(row[col] ?? '-')
            //             )}

            //             {/* {isHaveVerified &&
            //                         col === 'email' &&
            //                         (col == 'is_email_verified' ? (
            //                           <Tooltip title="Email Verified">
            //                             <Box
            //                               sx={{
            //                                 // mt: '25px',
            //                                 backgroundColor: 'green',
            //                                 borderRadius: '50%',
            //                                 display: 'inline-flex',
            //                                 alignItems: 'center',
            //                                 justifyContent: 'center',
            //                                 marginLeft: '5px',
            //                                 padding: '1px',
            //                               }}
            //                             >
            //                               <IconCheck color="white" size={16} />
            //                             </Box>
            //                           </Tooltip>
            //                         ) : (
            //                           <Tooltip title="Email Not Verified">
            //                             <Box
            //                               sx={{
            //                                 // mt: '25px',
            //                                 backgroundColor: 'red',
            //                                 borderRadius: '50%',
            //                                 display: 'inline-flex',
            //                                 alignItems: 'center',
            //                                 justifyContent: 'center',
            //                                 marginLeft: '5px',
            //                                 padding: '1px',
            //                               }}
            //                             >
            //                               <IconX color="white" size={16} />
            //                             </Box>
            //                           </Tooltip>
            //                         ))} */}
            //           </>
            //         )}
            //       </TableCell>
            //     );
            //   })}
            //   {isHaveCard && (
            //     <TableCell>
            //       <Typography variant="body2" color="text.secondary"></Typography>
            //     </TableCell>
            //   )}

            //   {isHaveAction && !isActionVisitor && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         bgcolor: 'background.paper',
            //         zIndex: 2,
            //         p: 0,
            //         verticalAlign: 'middle',
            //       }}
            //     >
            //       <Box
            //         sx={{
            //           display: 'flex',
            //           alignItems: 'center',
            //           justifyContent: 'center',
            //           gap: 1,
            //           px: 1.5,
            //           py: 1.25,
            //           height: '100%',
            //         }}
            //       >
            //         {isHaveApproval ? (
            //           (row as any)?.status == null ? (
            //             <>
            //               <Box
            //                 sx={{
            //                   display: 'flex',
            //                   alignItems: 'center',
            //                   justifyContent: 'center',
            //                   gap: 1,
            //                   px: 1.5,
            //                   py: 1.25,
            //                   height: '100%',
            //                   borderBottom: 'none',
            //                 }}
            //               >
            //                 {/* ✅ Accept / Denied */}
            //                 <Tooltip title="Accept">
            //                   <Button
            //                     variant="contained"
            //                     color="primary"
            //                     size="small"
            //                     sx={{
            //                       minWidth: 64,
            //                       textTransform: 'none',
            //                       borderBottom: 'none',
            //                     }}
            //                     onClick={() => onAccept?.(row)}
            //                   >
            //                     Accept
            //                   </Button>
            //                 </Tooltip>

            //                 <Tooltip title="Deny">
            //                   <Button
            //                     variant="contained"
            //                     color="error"
            //                     size="small"
            //                     sx={{ minWidth: 64, textTransform: 'none' }}
            //                     onClick={() => onDenied?.(row)}
            //                   >
            //                     Denied
            //                   </Button>
            //                 </Tooltip>
            //               </Box>
            //             </>
            //           ) : (
            //             <Box
            //               sx={{
            //                 position: 'sticky',
            //                 right: 0,
            //                 bgcolor: 'background.paper',
            //                 zIndex: 2,
            //                 p: 0,
            //                 verticalAlign: 'middle',
            //               }}
            //             >
            //               -
            //             </Box>
            //           )
            //         ) : isHaveAccess ? (
            //           <TableCell
            //             sx={{
            //               position: 'sticky',
            //               right: 0,
            //               bgcolor: 'background.paper',
            //               zIndex: 2,
            //               p: 0,
            //               verticalAlign: '',
            //               textAlign: 'center',
            //               display: 'flex',
            //               alignItems: 'flex-start',
            //             }}
            //           >
            //             {getAccessActions(row)}
            //           </TableCell>
            //         ) : isHaveView ? (
            //           <>
            //             <Tooltip title="View Invitation">
            //               <IconButton
            //                 onClick={() => onView?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'gray !important',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'success.dark',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <RemoveRedEyeIcon width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>

            //             <Tooltip title="Edit Invitation">
            //               <IconButton
            //                 onClick={() => onEdit?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: '#FA896B',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: '#FA896B',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconPencil width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>
            //           </>
            //         ) : isHavePermission ? (
            //           <>
            //             <Tooltip title="Edit">
            //               <IconButton
            //                 onClick={() => onEdit?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: '#FA896B',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': { backgroundColor: '#e06f52', color: 'white' },
            //                 }}
            //               >
            //                 <IconPencil width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>

            //             {/* 🗑 Delete */}
            //             <Tooltip title="Delete">
            //               <IconButton
            //                 onClick={() => onDelete?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'error.main',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'rgba(255, 0, 0, 0.7)',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconTrash width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>
            //             <Tooltip title="Permission">
            //               <Button
            //                 onClick={() => onPermission?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                 }}
            //                 variant="contained"
            //                 color="primary"
            //               >
            //                 {/* <IconRefresh width={18} height={18} /> */}
            //                 Permission
            //               </Button>
            //             </Tooltip>
            //           </>
            //         ) : isHaveViewAndAction ? (
            //           <>
            //             <Tooltip title="View Detail Schedule">
            //               <IconButton
            //                 onClick={() => onView?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'gray !important',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'success.dark',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <RemoveRedEyeIcon width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>
            //             <Tooltip title="Edit">
            //               <IconButton
            //                 onClick={() => onEdit?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: '#FA896B',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': { backgroundColor: '#e06f52', color: 'white' },
            //                 }}
            //               >
            //                 <IconPencil width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>

            //             {/* 🗑 Delete */}
            //             <Tooltip title="Delete">
            //               <IconButton
            //                 onClick={() => onDelete?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'error.main',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'rgba(255, 0, 0, 0.7)',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconTrash width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>
            //             <Tooltip title="Sync Visitor Type">
            //               <IconButton
            //                 onClick={() => onView?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'gray !important',
            //                   width: 28,
            //                   height: 28,
            //                   padding: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'success.dark',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconRefresh width={18} height={18} />
            //               </IconButton>
            //             </Tooltip>
            //           </>
            //         ) : isBlacklistAction ? (
            //           <Tooltip
            //             title={row.is_blacklist ? 'Blacklist Visitor' : 'Whitelist Visitor'}
            //             arrow
            //             placement="top"
            //             slotProps={{
            //               tooltip: {
            //                 sx: {
            //                   fontSize: '0.85rem',
            //                   padding: '8px 14px',
            //                 },
            //               },
            //             }}
            //           >
            //             <Button
            //               size="small"
            //               startIcon={row.is_blacklist ? <IconCheck /> : <IconXboxX />}
            //               onClick={() => onBlacklist?.(row)}
            //               sx={{
            //                 textTransform: 'none',
            //                 borderRadius: 1,
            //                 fontWeight: 500,
            //                 backgroundColor: row.is_blacklist ? '#16a34a' : '#000',
            //                 color: 'white',
            //                 '&:hover': {
            //                   backgroundColor: row.is_blacklist ? '#15803d' : '#000',
            //                   opacity: 0.8,
            //                 },
            //               }}
            //             >
            //               {row.is_blacklist ? 'Whitelist' : 'Blacklist'}
            //             </Button>
            //           </Tooltip>
            //         ) : isActionListVisitor ? (
            //           <>
            //             {/* <Tooltip
            //                         title="Block Visitor"
            //                         arrow
            //                         placement="top"
            //                         slotProps={{
            //                           tooltip: {
            //                             sx: {
            //                               fontSize: '0.8rem',
            //                               padding: '8px 14px',
            //                             },
            //                           },
            //                         }}
            //                       >
            //                         <Button
            //                           // variant="contained"
            //                           // color="error"
            //                           size="small"
            //                           startIcon={<IconForbid2 />}
            //                           // onClick={() => onBlock?.(row)} // optional trigger
            //                           sx={{
            //                             textTransform: 'none',
            //                             borderRadius: 1,
            //                             fontWeight: 500,
            //                             backgroundColor: '#000',
            //                             color: 'white',
            //                             '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
            //                           }}
            //                         >
            //                           Block
            //                         </Button>
            //                       </Tooltip> */}
            //             <Tooltip
            //               title="Blacklist Visitor"
            //               arrow
            //               placement="top"
            //               slotProps={{
            //                 tooltip: {
            //                   sx: {
            //                     fontSize: '0.8rem',
            //                     padding: '8px 14px',
            //                   },
            //                 },
            //               }}
            //             >
            //               <Button
            //                 // variant="contained"
            //                 // color="error"
            //                 size="small"
            //                 startIcon={<IconXboxX />}
            //                 // onClick={() => onBlock?.(row)} // optional trigger
            //                 sx={{
            //                   textTransform: 'none',
            //                   borderRadius: 1,
            //                   fontWeight: 500,
            //                   backgroundColor: '#6B0000',
            //                   color: 'white',
            //                   '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
            //                 }}
            //               >
            //                 Blacklist
            //               </Button>
            //             </Tooltip>
            //             <Tooltip
            //               title="Sign alert to visitor"
            //               arrow
            //               placement="top"
            //               slotProps={{
            //                 tooltip: {
            //                   sx: {
            //                     fontSize: '0.8rem',
            //                     padding: '8px 14px',
            //                   },
            //                 },
            //               }}
            //             >
            //               <Button
            //                 // variant="contained"
            //                 // color="error"
            //                 size="small"
            //                 startIcon={<IconAlertSquare />}
            //                 // onClick={() => onBlock?.(row)} // optional trigger
            //                 sx={{
            //                   textTransform: 'none',
            //                   borderRadius: 1,
            //                   fontWeight: 500,
            //                   backgroundColor: '#FFC107',
            //                   // width: '100%',
            //                   px: 1,
            //                   textWrap: 'nowrap',
            //                   color: 'white',
            //                   '&:hover': { backgroundColor: '#FFC107 ', opacity: 0.8 },
            //                 }}
            //               >
            //                 Sign Alert
            //               </Button>
            //             </Tooltip>
            //           </>
            //         ) : (
            //           <Box display="flex" gap={0.5}>
            //             {isHaveSettingOperator &&
            //               (row.group_id?.toUpperCase() === GroupRoleId.OperatorAdmin ||
            //                 row.group_id?.toUpperCase() === GroupRoleId.OperatorVMS) && (
            //                 <Tooltip title="Setting">
            //                   <IconButton
            //                     onClick={() => onSettingOperator?.(row)}
            //                     disableRipple
            //                     sx={{
            //                       color: 'white',
            //                       backgroundColor: '#000',
            //                       width: 28,
            //                       height: 28,
            //                       p: 0.5,
            //                       borderRadius: '50%',
            //                       '&:hover': { backgroundColor: '#000', color: 'white' },
            //                     }}
            //                   >
            //                     <IconSettings width={14} height={14} />
            //                   </IconButton>
            //                 </Tooltip>
            //               )}
            //             <Tooltip title="Edit">
            //               <IconButton
            //                 onClick={() => onEdit?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: '#FA896B',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': { backgroundColor: '#e06f52', color: 'white' },
            //                 }}
            //               >
            //                 <IconPencil width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>

            //             {/* 🗑 Delete */}
            //             <Tooltip title="Delete">
            //               <IconButton
            //                 onClick={() => onDelete?.(row)}
            //                 disableRipple
            //                 sx={{
            //                   color: 'white',
            //                   backgroundColor: 'error.main',
            //                   width: 28,
            //                   height: 28,
            //                   p: 0.5,
            //                   borderRadius: '50%',
            //                   '&:hover': {
            //                     backgroundColor: 'rgba(255, 0, 0, 0.7)',
            //                     color: 'white',
            //                   },
            //                 }}
            //               >
            //                 <IconTrash width={14} height={14} />
            //               </IconButton>
            //             </Tooltip>
            //           </Box>
            //         )}
            //       </Box>
            //     </TableCell>
            //   )}

            //   {isHaveActionRevoke && !isActionVisitor && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         background: 'white',
            //         zIndex: 2,
            //         display: 'flex',
            //         gap: 1,
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //       }}
            //     >
            //       <Tooltip title="Edit">
            //         <Button
            //           onClick={() => onActionRevoke?.(row)}
            //           disableRipple
            //           sx={{
            //             color: 'white',
            //             backgroundColor: '#000',

            //             // width: 28,
            //             // height: 28,
            //             // padding: 0.5,
            //             // borderRadius: '50%',
            //           }}
            //         >
            //           {/* <IconKeyOff width={14} height={14} />
            //            */}
            //           Revoke
            //         </Button>
            //       </Tooltip>
            //     </TableCell>
            //   )}

            //   {isHaveActionOnlyEdit && !isActionVisitor && isSelectedType && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         background: 'white',
            //         zIndex: 2,
            //         display: 'flex',
            //         gap: 1,
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //       }}
            //     >
            //       <Box display="flex" alignItems="end">
            //         {/* Tombol Edit (Primary, Kecil) */}
            //         <Tooltip title="Edit">
            //           <IconButton
            //             onClick={() => onEdit?.(row)}
            //             disableRipple
            //             sx={{
            //               color: 'white',
            //               backgroundColor: '#FA896B',

            //               width: 28,
            //               height: 28,
            //               padding: 0.5,
            //               borderRadius: '50%',
            //             }}
            //           >
            //             <IconPencil width={14} height={14} />
            //           </IconButton>
            //         </Tooltip>
            //       </Box>
            //     </TableCell>
            //   )}

            //   {isButtonGiveAccess && isButtonRegisteredSite && isButtonSiteAccess && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         background: 'white',
            //         zIndex: 2,
            //         display: 'flex',
            //         gap: 1,
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //       }}
            //     >
            //       <Box display="flex" alignItems="end" gap={1}>
            //         {/* Tombol Edit (Primary, Kecil) */}
            //         <Tooltip title="Give Access" arrow>
            //           <Button
            //             onClick={() => onGiveAccess?.(row)}
            //             // disableRipple
            //             variant="contained"
            //             color="primary"
            //           >
            //             Give Access
            //           </Button>
            //         </Tooltip>
            //         <Tooltip title="Registered Site" arrow>
            //           <Button
            //             onClick={() => onRegisteredSite?.(row)}
            //             // disableRipple
            //             variant="contained"
            //             color="secondary"
            //           >
            //             Registered Site
            //           </Button>
            //         </Tooltip>
            //         <Tooltip title="Site Access" arrow>
            //           <Button
            //             onClick={() => onSiteAccess?.(row)}
            //             // disableRipple
            //             variant="contained"
            //             color="warning"
            //           >
            //             Site Access
            //           </Button>
            //         </Tooltip>
            //       </Box>
            //     </TableCell>
            //   )}

            //   {isCopyLink && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         background: 'white',
            //         zIndex: 2,
            //         display: 'flex',
            //         gap: 0.5,
            //         mt: 0.5,
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //       }}
            //     >
            //       <Box display="flex" alignItems="end" gap={1}>
            //         {/* Tombol Edit (Primary, Kecil) */}
            //         <Tooltip title="Copy Link" arrow>
            //           <IconButton
            //             onClick={() => onCopyLink?.(row)}
            //             disableRipple
            //             sx={{
            //               color: 'white',
            //               backgroundColor: '#FA896B',
            //               width: 28,
            //               height: 28,
            //               p: 0.5,
            //               borderRadius: '50%',
            //               '&:hover': {
            //                 backgroundColor: 'rgba(255, 0, 0, 0.7)',
            //                 color: 'white',
            //               },
            //             }}
            //           >
            //             <IconCopy width={14} height={14} />
            //           </IconButton>
            //         </Tooltip>
            //         <Tooltip title="Detail Link" arrow>
            //           <IconButton
            //             onClick={() => onDetailLink?.(row)}
            //             disableRipple
            //             sx={{
            //               color: 'white',
            //               backgroundColor: 'gray',
            //               width: 28,
            //               height: 28,
            //               p: 0.5,
            //               borderRadius: '50%',
            //               '&:hover': {
            //                 backgroundColor: 'rgba(0, 0, 0, 0.7)',
            //                 color: 'white',
            //               },
            //             }}
            //           >
            //             {/* <IconCopy width={14} height={14} /> */}
            //             <IconEye width={24} height={24} />
            //           </IconButton>
            //         </Tooltip>
            //         <Tooltip title="Delete Link" arrow>
            //           <IconButton
            //             onClick={() => onDelete?.(row)}
            //             disableRipple
            //             sx={{
            //               color: 'white',
            //               backgroundColor: 'red',
            //               width: 28,
            //               height: 28,
            //               p: 0.5,
            //               borderRadius: '50%',
            //               '&:hover': {
            //                 backgroundColor: 'red',
            //                 color: 'white',
            //               },
            //             }}
            //           >
            //             {/* <IconCopy width={14} height={14} /> */}
            //             <IconTrash width={24} height={24} />
            //           </IconButton>
            //         </Tooltip>
            //       </Box>
            //     </TableCell>
            //   )}

            //   {isButtonEnabled && isButtonDisabled && (
            //     <TableCell
            //       sx={{
            //         position: 'sticky',
            //         right: 0,
            //         background: 'white',
            //         zIndex: 2,
            //         display: 'flex',
            //         gap: 1,
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //       }}
            //     >
            //       <Box display="flex" alignItems="end" gap={1}>
            //         {/* Tombol Edit (Primary, Kecil) */}
            //         <Tooltip title="Enabled" arrow>
            //           <Button
            //             onClick={() => onGiveAccess?.(row)}
            //             // disableRipple
            //             variant="contained"
            //             color="primary"
            //           >
            //             Enabled
            //           </Button>
            //         </Tooltip>
            //         <Tooltip title="Disabled" arrow>
            //           <Button
            //             onClick={() => onIsButtonDisabled?.(row)}
            //             // disableRipple
            //             variant="contained"
            //             color="error"
            //           >
            //             Disabled
            //           </Button>
            //         </Tooltip>
            //       </Box>
            //     </TableCell>
            //   )}
            // </TableRow>
            <TableRowItem
              key={row.id}
              row={row}
              index={index}
              {...{
                loading,
                rowsPerPage,
                isHaveChecked,
                isHaveAction,
                isActionVisitor,
                paginatedData,
                columns,
                checkedIds,
                handleCheckRow,
                isTreeSiteType,
                toggleRow,
                openRow,
                page,
                isActionEmployee,
                isHaveVip,
                htmlFields,
                htmlClampLines,
                htmlMaxWidth,
                isAccessControlType,
                isHavePeriod,
                isHaveEmployee,
                isHaveGender,
                isSiteSpaceType,
                isHaveImage,
                imageFields,
                isDataVerified,
                tooltipLabels,
                isHavePdf,
                onFileClick,
                isHaveVerified,
                visiblePasswords,
                togglePassword,
                isHavePassword,
                isHaveCard,
                isHaveBooleanSwitch,
                onBooleanSwitchChange,
                isHaveObjectData,
                objectFields,
                isHaveIntegration,
                onNameClick,
                isHaveApproval,
                onAccept,
                onDenied,
                isHaveAccess,
                getAccessActions,
                isHaveView,
                onView,
                onEdit,
                isHavePermission,
                onPermission,
                isHaveViewAndAction,
                isBlacklistAction,
                onBlacklist,
                isActionListVisitor,
                isHaveSettingOperator,
                onSettingOperator,
                isHaveActionRevoke,
                onActionRevoke,
                isHaveActionOnlyEdit,
                isSelectedType,
                isButtonGiveAccess,
                isButtonRegisteredSite,
                isButtonSiteAccess,
                onGiveAccess,
                onRegisteredSite,
                onEmployeeClick,
                onSiteAccess,
                isCopyLink,
                onCopyLink,
                onDetailLink,
                isButtonEnabled,
                isButtonDisabled,
                onIsButtonDisabled,
                isHaveVisitor,
                onDelete,
              }}
            />
          ))
        )}
      </TableBody>
    </>
  );
};

const TableRowItem = React.memo(
  (props: any) => {
    const {
      rowsPerPage,
      isHaveChecked,
      isHaveAction,
      isActionVisitor,
      columns,
      checkedIds,
      handleCheckRow,
      isTreeSiteType,
      toggleRow,
      openRow,
      page,
      isActionEmployee,
      isHaveVip,
      htmlFields,
      htmlClampLines,
      htmlMaxWidth,
      isAccessControlType,
      isHavePeriod,
      isHaveEmployee,
      isHaveGender,
      isSiteSpaceType,
      isHaveImage,
      imageFields,
      isDataVerified,
      tooltipLabels,
      isHavePdf,
      onFileClick,
      isHaveVerified,
      visiblePasswords,
      togglePassword,
      isHavePassword,
      isHaveCard,
      isHaveBooleanSwitch,
      onBooleanSwitchChange,
      isHaveObjectData,
      objectFields,
      isHaveIntegration,
      onNameClick,
      isHaveApproval,
      onAccept,
      onDenied,
      isHaveAccess,
      getAccessActions,
      isHaveView,
      onView,
      onEdit,
      isHavePermission,
      onPermission,
      isHaveViewAndAction,
      isBlacklistAction,
      onBlacklist,
      isActionListVisitor,
      isHaveSettingOperator,
      onSettingOperator,
      isHaveActionRevoke,
      onActionRevoke,
      isHaveActionOnlyEdit,
      isSelectedType,
      isButtonGiveAccess,
      isButtonRegisteredSite,
      isButtonSiteAccess,
      onGiveAccess,
      onRegisteredSite,
      onEmployeeClick,
      onSiteAccess,
      isCopyLink,
      onCopyLink,
      onDetailLink,
      isButtonEnabled,
      isButtonDisabled,
      onIsButtonDisabled,
      isHaveVisitor,
      row,
      index,
      onDelete,
      onPrint,
      onDetail,
    } = props;

    const CHECKBOX_COL_WIDTH = 40;
    const ACTION_COL_WIDTH = 105;
    const INDEX_COL_WIDTH = 56;
    const DATA_COL_WIDTH = 180;
    const STICKY_DATA_COUNT = 2;

    const getLeftBase = () =>
      (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) +
      (isActionVisitor ? ACTION_COL_WIDTH : 0) +
      INDEX_COL_WIDTH;
    const getStickyLeft = (i: number) => getLeftBase() + i * DATA_COL_WIDTH;

    const isStickyVisitorCol = (i: number) => isHaveVisitor && i < STICKY_DATA_COUNT;
    const statusBgMap: Record<string, string> = {
      Checkin: '#21c45d', // hijau
      Checkout: '#F44336', // merah
      Block: '#000000', // hitam
      Deny: '#8B0000', // merah tua
      Approve: '#21c45d', // hijau
      Pracheckin: '#21c45d', // hijau
    };

    const defaultBg = '#9E9E9E';

    const GENDER_MAP: Record<string, string> = {
      '0': 'Female',
      '1': 'Male',
      '2': 'Prefer not to say',
    };

    const SITE_MAP: Record<number, string> = {
      0: 'Site',
      1: 'Building',
      2: 'Floor',
      3: 'Room',
    };

    const formatDate = (date?: string) => {
      if (!date) return '-'; // fallback kalau kosong
      return moment.utc(date).local().format('DD MMMM YYYY, HH:mm');
    };

    const CARD_STATUS: Record<number, string> = {
      0: 'Not Found',
      1: 'Active',
      2: 'Lost',
      3: 'Broken',
      4: 'Not Return',
    };

    const DOCUMENT_TYPE: Record<number, string> = {
      0: 'Card',
      1: 'Document',
      2: 'Face',
    };

    const BASE_URL = axiosInstance2.defaults.baseURL + '/cdn';

    return (
      <TableRow key={row.id}>
        {isHaveChecked && (
          <TableCell
            padding="checkbox"
            sx={{ position: 'sticky', left: 0, zIndex: 3, background: 'white' }}
          >
            <Checkbox
              checked={checkedIds.includes(row.id)}
              onChange={(e) => handleCheckRow(row.id as string, e.target.checked)}
            />
          </TableCell>
        )}

        {isTreeSiteType && (
          <TableCell width={50}>
            <IconButton size="small" onClick={() => toggleRow(row.id)}>
              {openRow === row.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </TableCell>
        )}

        {isHaveAction && isActionVisitor && (
          <TableCell
            sx={{
              position: 'sticky',
              left: isHaveChecked ? CHECKBOX_COL_WIDTH : 0,
              zIndex: 3,
              background: 'white',
              minWidth: ACTION_COL_WIDTH,
              maxWidth: ACTION_COL_WIDTH,
            }}
          >
            <Box display="flex" alignItems="center" gap={0.3} justifyContent={'center'}>
              {/* Detail Visitor */}
              <Tooltip title="Detail Data">
                <IconButton
                  onClick={() => onView?.(row)}
                  disableRipple
                  sx={{
                    color: 'white',
                    backgroundColor: 'gray !important',
                    width: 28,
                    height: 28,
                    padding: 0.5,
                    borderRadius: '50%',
                    '&:hover': {
                      backgroundColor: 'success.dark',
                      color: 'white',
                    },
                  }}
                >
                  <RemoveRedEyeIcon width={18} height={18} />
                </IconButton>
              </Tooltip>
              {isActionEmployee == false && (
                <>
                  {/* Tombol Checkin */}
                  <Tooltip title="Check In">
                    <IconButton
                      onClick={() => onEdit?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: '#13DEB9 !important',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                          color: 'white',
                        },
                      }}
                    >
                      <IconLogin2 width={18} height={18} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Check Out">
                    <IconButton
                      onClick={() => onDelete?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'error.main',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                          color: 'white',
                        },
                      }}
                    >
                      <IconLogout2 width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </TableCell>
        )}

        <TableCell
          sx={{
            position: { xs: 'static', lg: 'sticky' },
            left:
              (isHaveChecked ? CHECKBOX_COL_WIDTH : 0) + (isActionVisitor ? ACTION_COL_WIDTH : 0),
            zIndex: 3,
            background: 'white',
            minWidth: INDEX_COL_WIDTH,
            maxWidth: INDEX_COL_WIDTH,
            fontSize: '0.85rem !important',
          }}
        >
          {index + 1 + page * rowsPerPage}
        </TableCell>

        {columns.map((col: any, idx: any) => {
          const makeSticky = isStickyVisitorCol(idx);

          return (
            <TableCell
              key={col}
              sx={{
                ...(makeSticky && {
                  position: { xs: 'static', lg: 'sticky' },
                  left: getStickyLeft(idx),
                  zIndex: 3,
                  background: 'white',
                  minWidth: DATA_COL_WIDTH,
                  maxWidth: DATA_COL_WIDTH,
                }),
                fontSize: '0.85rem !important',
              }}
            >
              {isHaveVip && col === 'is_vip' ? (
                row[col] ? (
                  <Tooltip title="VIP">
                    <IconStarFilled color="gold" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Not VIP">
                    <IconStarFilled color="lightgray" />
                  </Tooltip>
                )
              ) : htmlFields.includes(col) && typeof row[col] === 'string' ? (
                <RichHtmlCell
                  html={String(row[col] ?? '')}
                  lines={htmlClampLines}
                  maxWidth={htmlMaxWidth}
                />
              ) : col === 'type' && isAccessControlType ? (
                <>{row.type === 0 ? 'Access' : 'Group'}</>
              ) : col === 'card_status' ? (
                (CARD_STATUS[Number(row[col])] ?? String(row[col] ?? '-'))
              ) : col === 'is_employee' ? (
                row[col] ? (
                  <IconUserCheck size={20} color="green" />
                ) : (
                  <IconUserX size={20} color="red" />
                )
              ) : col === 'visitor_status' ? (
                <Box
                  sx={{
                    backgroundColor: statusBgMap[row.visitor_status] || defaultBg,
                    borderRadius: '999px',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.visitor_status || '-'}
                </Box>
              ) : col === 'document_type' ? (
                (DOCUMENT_TYPE[Number(row[col])] ?? String(row[col] ?? '-'))
              ) : col === 'status' && isHaveApproval ? (
                row[col] === 'Approve' ? (
                  <Typography
                    sx={{
                      color: 'success.main',
                      fontWeight: 400,
                      backgroundColor: 'success.light',
                      textAlign: 'center',
                      padding: 0.5,
                      borderRadius: '8px',
                      width: '100px',
                    }}
                    variant="body2"
                  >
                    Approve
                  </Typography>
                ) : row[col] === 'Reject' ? (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontWeight: 400,
                      backgroundColor: 'error.light',
                      textAlign: 'center',
                      padding: 0.5,
                      borderRadius: '8px',
                      width: '100px',
                    }}
                    variant="body2"
                  >
                    Reject
                  </Typography>
                ) : (
                  <>
                    <Typography
                      sx={{
                        color: '#fff',
                        fontWeight: 400,
                        backgroundColor: 'grey',
                        textAlign: 'center',
                        padding: 0.5,
                        borderRadius: '8px',
                        width: '100px',
                      }}
                      variant="body2"
                    >
                      Pending
                    </Typography>
                  </>
                )
              ) : isHavePeriod && col === 'visitor_period_start' ? (
                <>
                  {formatDate(row[col] as string)}
                  <br />
                </>
              ) : isHaveEmployee && col === 'host' ? (
                <Tooltip title="View Host">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEmployeeClick?.(row)}
                    sx={{
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      backgroundColor: (theme) => theme.palette.grey[100],
                    }}
                  >
                    <IconUserFilled />
                  </IconButton>
                </Tooltip>
              ) : col === 'employee' ? (
                <>
                  {row.employee && (
                    <Tooltip title="You are the host">
                      <IconStarFilled color="gold" size={24} style={{ color: 'gold' }} />
                    </Tooltip>
                  )}
                </>
              ) : isHaveGender && col === 'gender' ? (
                (GENDER_MAP[String(row[col])] ?? String(row[col] ?? '-'))
              ) : isSiteSpaceType && col === 'type' ? (
                (SITE_MAP[Number(row[col])] ?? String(row[col] ?? '-'))
              ) : isHaveImage &&
                imageFields.includes(col) &&
                typeof row[col] === 'string' &&
                row[col].trim() !== '' ? (
                <img
                  loading="lazy"
                  src={(() => {
                    const value = row[col];
                    if (value.startsWith('data:image')) return value;
                    if (value.startsWith('http')) return value;
                    return `${BASE_URL}${value}`;
                  })()}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : isHaveImage && imageFields.includes(col) ? (
                <>-</>
              ) : (isDataVerified && col === 'secure') ||
              (isDataVerified && col === 'active') ||
                col === 'can_upload' ||
                col === 'can_signed' ||
                col === 'can_declined' ||
                col === 'is_primary' ||
                col === 'is_employee_used' ||
                col === 'is_multi_site' ||
                col === 'is_used' ||
                col === 'link_status' ||
                col === 'is_active' ||
                col === 'early_access' ? (
                <Box display="flex" alignItems="center" justifyContent="start" width="100%">
                  <Tooltip
                    title={
                      row[col]
                        ? (tooltipLabels[col]?.true ?? 'Verified')
                        : (tooltipLabels[col]?.false ?? 'Not Verified')
                    }
                  >
                    <Box
                      sx={(theme) => ({
                        backgroundColor: row[col]
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: '2px',
                      })}
                    >
                      {row[col] ? (
                        <IconCheck color="white" size={16} />
                      ) : (
                        <IconX color="white" size={16} />
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              ) : isHavePdf && col === 'file' ? (
                <Tooltip title="View File">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onFileClick?.(row)}
                    sx={{
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      backgroundColor: (theme) => theme.palette.grey[100],
                    }}
                  >
                    <IconFileText />
                  </IconButton>
                </Tooltip>
              ) : col === 'email' ? (
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="start"
                  textAlign={'left'}
                  gap={0.5}
                  width="100%"
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  <span>{(row[col] as React.ReactNode) ?? '-'}</span>

                  {isHaveVerified &&
                    (row.is_email_verified ? (
                      <Tooltip title="Email Verified">
                        <Box
                          sx={{
                            backgroundColor: '#13DEB9',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1px',
                          }}
                        >
                          <IconCheck color="white" size={16} />
                        </Box>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Email Not Verified">
                        <Box
                          sx={{
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1px',
                          }}
                        >
                          <IconX color="white" size={16} />
                        </Box>
                      </Tooltip>
                    ))}
                </Box>
              ) : col === 'password' ? (
                <Box
                  display="inline-flex"
                  alignItems="center"
                  gap={0.5}
                  justifyContent={'start'}
                  width="100%"
                >
                  {isHavePassword ? (
                    visiblePasswords[row.id] ? (
                      <>
                        <span>{String(row[col] ?? '-')}</span>
                        <Tooltip title="Hide Password">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePassword(row.id);
                            }}
                          >
                            <IconEyeOff size={18} />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Show Password">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePassword(row.id);
                          }}
                          sx={{
                            bgcolor: 'grey.200',
                            '&:hover': {
                              bgcolor: 'grey.300',
                            },
                            borderRadius: '50%',
                            p: 0.5,
                          }}
                        >
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    )
                  ) : (
                    '••••••••'
                  )}
                </Box>
              ) : isHaveCard && col === 'card' ? (
                row[col] ? (
                  <>{row[col]}</>
                ) : (
                  <>-</>
                )
              ) : col === 'is_blacklist' ? (
                <>
                  <Box
                    sx={(theme) => ({
                      backgroundColor: row[col]
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: '2px',
                    })}
                  >
                    {row[col] ? (
                      <Tooltip title="Blacklist" arrow>
                        <IconCheck color="white" size={18} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Not Blacklist" arrow>
                        <IconX color="white" size={16} />
                      </Tooltip>
                    )}
                  </Box>
                </>
              ) : isHaveBooleanSwitch && typeof row[col] === 'boolean' ? (
                <Box display="flex" alignItems="center" width={'100%'} justifyContent={'center'}>
                  <Switch
                    checked={row[col] as boolean}
                    onChange={(_, checked) => onBooleanSwitchChange?.(row.id, col, checked)}
                    color="primary"
                    size="small"
                  />
                </Box>
              ) : isHaveObjectData &&
                objectFields?.includes(col) &&
                typeof row[col] === 'object' &&
                row[col] !== null ? (
                Array.isArray(row[col]) ? (
                  row[col].map((item: any) => item.name).join(', ')
                ) : (
                  ((row[col] as { name?: string }).name ?? '-')
                )
              ) : (
                <>
                  {isHaveIntegration && col === 'name' && onNameClick ? (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        // e.stopPropagation();
                        onNameClick?.(row);
                      }}
                      sx={{
                        p: 1,
                        minWidth: 0,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        textDecoration: 'underline',
                      }}
                      // target="_blank"
                    >
                      {String(row[col] ?? '-')}
                    </Button>
                  ) : (
                    String(row[col] ?? '-')
                  )}

                  {/* {isHaveVerified &&
                                    col === 'email' &&
                                    (col == 'is_email_verified' ? (
                                      <Tooltip title="Email Verified">
                                        <Box
                                          sx={{
                                            // mt: '25px',
                                            backgroundColor: 'green',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '5px',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconCheck color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Email Not Verified">
                                        <Box
                                          sx={{
                                            // mt: '25px',
                                            backgroundColor: 'red',
                                            borderRadius: '50%',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '5px',
                                            padding: '1px',
                                          }}
                                        >
                                          <IconX color="white" size={16} />
                                        </Box>
                                      </Tooltip>
                                    ))} */}
                </>
              )}
            </TableCell>
          );
        })}
        {isHaveCard && (
          <TableCell>
            <Typography variant="body2" color="text.secondary"></Typography>
          </TableCell>
        )}

        {isHaveAction && !isActionVisitor && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              bgcolor: 'background.paper',
              zIndex: 2,
              p: 0,
              verticalAlign: 'middle',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 1.5,
                py: 1.25,
                height: '100%',
              }}
            >
              {isHaveApproval ? (
                (row as any)?.approval_status == 'Pending' ? (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1.25,
                        height: '100%',
                        borderBottom: 'none',
                      }}
                    >
                      {/* ✅ Accept / Denied */}
                      <Tooltip title="Approve">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            minWidth: 64,
                            textTransform: 'none',
                            borderBottom: 'none',
                          }}
                          onClick={() => onAccept?.(row)}
                        >
                          Approve
                        </Button>
                      </Tooltip>

                      <Tooltip title="Reject">
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          sx={{ minWidth: 64, textTransform: 'none' }}
                          onClick={() => onDenied?.(row)}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      position: 'sticky',
                      right: 0,
                      bgcolor: 'background.paper',
                      zIndex: 2,
                      p: 0,
                      verticalAlign: 'middle',
                    }}
                  >
                    
                  </Box>
                )
              ) : isHaveAccess ? (
                <TableCell
                  sx={{
                    position: 'sticky',
                    right: 0,
                    bgcolor: 'background.paper',
                    zIndex: 2,
                    p: 0,
                    verticalAlign: '',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  {getAccessActions(row)}
                </TableCell>
              ) : isHaveView ? (
                <>
                  <Tooltip title="View Invitation">
                    <IconButton
                      onClick={() => onView?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'gray !important',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                          color: 'white',
                        },
                      }}
                    >
                      <RemoveRedEyeIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip>

                  {/* <Tooltip title="Edit Invitation">
                    <IconButton
                      onClick={() => onEdit?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: '#FA896B',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: '#FA896B',
                          color: 'white',
                        },
                      }}
                    >
                      <IconPencil width={18} height={18} />
                    </IconButton>
                  </Tooltip> */}
                </>
              ) : isHavePermission ? (
                <>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEdit?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: '#FA896B',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': { backgroundColor: '#e06f52', color: 'white' },
                      }}
                    >
                      <IconPencil width={14} height={14} />
                    </IconButton>
                  </Tooltip>

                  {/* 🗑 Delete */}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => onDelete?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'error.main',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: 'white',
                        },
                      }}
                    >
                      <IconTrash width={14} height={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Permission">
                    <Button
                      onClick={() => onPermission?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                      }}
                      variant="contained"
                      color="primary"
                    >
                      {/* <IconRefresh width={18} height={18} /> */}
                      Permission
                    </Button>
                  </Tooltip>
                </>
              ) : isHaveViewAndAction ? (
                <>
                  <Tooltip title="View Detail Schedule">
                    <IconButton
                      onClick={() => onView?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'gray !important',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                          color: 'white',
                        },
                      }}
                    >
                      <RemoveRedEyeIcon width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEdit?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: '#FA896B',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': { backgroundColor: '#e06f52', color: 'white' },
                      }}
                    >
                      <IconPencil width={14} height={14} />
                    </IconButton>
                  </Tooltip>

                  {/* 🗑 Delete */}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => onDelete?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'error.main',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: 'white',
                        },
                      }}
                    >
                      <IconTrash width={14} height={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sync Visitor Type">
                    <IconButton
                      onClick={() => onView?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'gray !important',
                        width: 28,
                        height: 28,
                        padding: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                          color: 'white',
                        },
                      }}
                    >
                      <IconRefresh width={18} height={18} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : isBlacklistAction ? (
                <Tooltip
                  title={row.is_blacklist ? 'Blacklist Visitor' : 'Whitelist Visitor'}
                  arrow
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: '0.85rem',
                        padding: '8px 14px',
                      },
                    },
                  }}
                >
                  <Button
                    size="small"
                    startIcon={row.is_blacklist ? <IconCheck /> : <IconXboxX />}
                    onClick={() => onBlacklist?.(row)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      fontWeight: 500,
                      backgroundColor: row.is_blacklist ? '#16a34a' : '#000',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: row.is_blacklist ? '#15803d' : '#000',
                        opacity: 0.8,
                      },
                    }}
                  >
                    {row.is_blacklist ? 'Whitelist' : 'Blacklist'}
                  </Button>
                </Tooltip>
              ) : isActionListVisitor ? (
                <>
                  {/* <Tooltip
                                    title="Block Visitor"
                                    arrow
                                    placement="top"
                                    slotProps={{
                                      tooltip: {
                                        sx: {
                                          fontSize: '0.8rem',
                                          padding: '8px 14px',
                                        },
                                      },
                                    }}
                                  >
                                    <Button
                                      // variant="contained"
                                      // color="error"
                                      size="small"
                                      startIcon={<IconForbid2 />}
                                      // onClick={() => onBlock?.(row)} // optional trigger
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 1,
                                        fontWeight: 500,
                                        backgroundColor: '#000',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
                                      }}
                                    >
                                      Block
                                    </Button>
                                  </Tooltip> */}
                  <Tooltip
                    title="Blacklist Visitor"
                    arrow
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '0.8rem',
                          padding: '8px 14px',
                        },
                      },
                    }}
                  >
                    <Button
                      // variant="contained"
                      // color="error"
                      size="small"
                      startIcon={<IconXboxX />}
                      // onClick={() => onBlock?.(row)} // optional trigger
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1,
                        fontWeight: 500,
                        backgroundColor: '#6B0000',
                        color: 'white',
                        '&:hover': { backgroundColor: '#000 ', opacity: 0.8 },
                      }}
                    >
                      Blacklist
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title="Sign alert to visitor"
                    arrow
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '0.8rem',
                          padding: '8px 14px',
                        },
                      },
                    }}
                  >
                    <Button
                      // variant="contained"
                      // color="error"
                      size="small"
                      startIcon={<IconAlertSquare />}
                      // onClick={() => onBlock?.(row)} // optional trigger
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1,
                        fontWeight: 500,
                        backgroundColor: '#FFC107',
                        // width: '100%',
                        px: 1,
                        textWrap: 'nowrap',
                        color: 'white',
                        '&:hover': { backgroundColor: '#FFC107 ', opacity: 0.8 },
                      }}
                    >
                      Sign Alert
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <Box display="flex" gap={0.5}>
                  {isHaveSettingOperator &&
                    (row.group_id?.toUpperCase() === GroupRoleId.OperatorAdmin ||
                      row.group_id?.toUpperCase() === GroupRoleId.OperatorVMS) && (
                      <Tooltip title="Setting">
                        <IconButton
                          onClick={() => onSettingOperator?.(row)}
                          disableRipple
                          sx={{
                            color: 'white',
                            backgroundColor: '#000',
                            width: 28,
                            height: 28,
                            p: 0.5,
                            borderRadius: '50%',
                            '&:hover': { backgroundColor: '#000', color: 'white' },
                          }}
                        >
                          <IconSettings width={14} height={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEdit?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: '#FA896B',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': { backgroundColor: '#e06f52', color: 'white' },
                      }}
                    >
                      <IconPencil width={14} height={14} />
                    </IconButton>
                  </Tooltip>

                  {/* 🗑 Delete */}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => onDelete?.(row)}
                      disableRipple
                      sx={{
                        color: 'white',
                        backgroundColor: 'error.main',
                        width: 28,
                        height: 28,
                        p: 0.5,
                        borderRadius: '50%',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: 'white',
                        },
                      }}
                    >
                      <IconTrash width={14} height={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </TableCell>
        )}

        {isHaveActionRevoke && !isActionVisitor && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              background: 'white',
              zIndex: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip title="Edit">
              <Button
                onClick={() => onActionRevoke?.(row)}
                disableRipple
                sx={{
                  color: 'white',
                  backgroundColor: '#000',

                  // width: 28,
                  // height: 28,
                  // padding: 0.5,
                  // borderRadius: '50%',
                }}
              >
                {/* <IconKeyOff width={14} height={14} />
                 */}
                Revoke
              </Button>
            </Tooltip>
          </TableCell>
        )}

        {isHaveActionOnlyEdit && !isActionVisitor && isSelectedType && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              background: 'white',
              zIndex: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box display="flex" alignItems="end">
              {/* Tombol Edit (Primary, Kecil) */}
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => onEdit?.(row)}
                  disableRipple
                  sx={{
                    color: 'white',
                    backgroundColor: '#FA896B',

                    width: 28,
                    height: 28,
                    padding: 0.5,
                    borderRadius: '50%',
                  }}
                >
                  <IconPencil width={14} height={14} />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        )}

        {isButtonGiveAccess && isButtonRegisteredSite && isButtonSiteAccess && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              background: 'white',
              zIndex: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box display="flex" alignItems="end" gap={1}>
              {/* Tombol Edit (Primary, Kecil) */}
              <Tooltip title="Give Access" arrow>
                <Button
                  onClick={() => onGiveAccess?.(row)}
                  // disableRipple
                  variant="contained"
                  color="primary"
                >
                  Give Access
                </Button>
              </Tooltip>
              <Tooltip title="Registered Site" arrow>
                <Button
                  onClick={() => onRegisteredSite?.(row)}
                  // disableRipple
                  variant="contained"
                  color="secondary"
                >
                  Registered Site
                </Button>
              </Tooltip>
              <Tooltip title="Site Access" arrow>
                <Button
                  onClick={() => onSiteAccess?.(row)}
                  // disableRipple
                  variant="contained"
                  color="warning"
                >
                  Site Access
                </Button>
              </Tooltip>
            </Box>
          </TableCell>
        )}

        {isCopyLink && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              background: 'white',
              zIndex: 2,
              display: 'flex',
              gap: 0.5,
              mt: 0.5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box display="flex" alignItems="end" gap={1}>
              {/* Tombol Edit (Primary, Kecil) */}
              <Tooltip title="Copy Link" arrow>
                <IconButton
                  onClick={() => onCopyLink?.(row)}
                  disableRipple
                  sx={{
                    color: 'white',
                    backgroundColor: '#FA896B',
                    width: 28,
                    height: 28,
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 0, 0, 0.7)',
                      color: 'white',
                    },
                  }}
                >
                  <IconCopy width={14} height={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Detail Link" arrow>
                <IconButton
                  onClick={() => onDetailLink?.(row)}
                  disableRipple
                  sx={{
                    color: 'white',
                    backgroundColor: 'gray',
                    width: 28,
                    height: 28,
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                    },
                  }}
                >
                  {/* <IconCopy width={14} height={14} /> */}
                  <IconEye width={24} height={24} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Link" arrow>
                <IconButton
                  onClick={() => onDelete?.(row)}
                  disableRipple
                  sx={{
                    color: 'white',
                    backgroundColor: 'red',
                    width: 28,
                    height: 28,
                    p: 0.5,
                    borderRadius: '50%',
                    '&:hover': {
                      backgroundColor: 'red',
                      color: 'white',
                    },
                  }}
                >
                  {/* <IconCopy width={14} height={14} /> */}
                  <IconTrash width={24} height={24} />
                </IconButton>
              </Tooltip>
            </Box>
          </TableCell>
        )}

        {isButtonEnabled && isButtonDisabled && (
          <TableCell
            sx={{
              position: 'sticky',
              right: 0,
              background: 'white',
              zIndex: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box display="flex" alignItems="end" gap={1}>
              {/* Tombol Edit (Primary, Kecil) */}
              <Tooltip title="Enabled" arrow>
                <Button
                  onClick={() => onGiveAccess?.(row)}
                  // disableRipple
                  variant="contained"
                  color="primary"
                >
                  Enabled
                </Button>
              </Tooltip>
              <Tooltip title="Disabled" arrow>
                <Button
                  onClick={() => onIsButtonDisabled?.(row)}
                  // disableRipple
                  variant="contained"
                  color="error"
                >
                  Disabled
                </Button>
              </Tooltip>
            </Box>
          </TableCell>
        )}
      </TableRow>
    );
  },
  (prev, next) => {
    return (
      prev.row === next.row &&
      prev.index === next.index &&
      prev.checkedIds === next.checkedIds &&
      prev.openRow === next.openRow
    );
  },
);
