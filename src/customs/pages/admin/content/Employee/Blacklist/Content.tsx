import { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton } from '@mui/material';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';
import Container from 'src/components/container/PageContainer';
import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import {
  CreateEmployeeRequest,
  CreateEmployeeRequestSchema,
  Item,
} from 'src/customs/api/models/Admin/Employee';
import { getAllEmployeeBlacklistPagination } from 'src/customs/api/admin';

import { IconUsers } from '@tabler/icons-react';

import { useTableQueryParams } from 'src/hooks/useTableQueryParams';

type EmployeesTableRow = {
  id: string;
  name: string;
  faceimage?: string;
  organization_id?: string;
  department_id?: string;
  district_id?: string;
};

interface Filters {
  gender: number;
  organization: string;
  department: string;
  district: string;
  joinStart: string;
  exitEnd: string;
  statusEmployee: number;
}

const Content = () => {
  const [tableData, setTableData] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [tableRowEmployee, setTableRowEmployee] = useState<EmployeesTableRow[]>([]);
  const [sortDir, setSortDir] = useState<string>('desc');
  const { page, search, setPage, setSearch } = useTableQueryParams();

  const [filters, setFilters] = useState<Filters>({
    joinStart: '',
    exitEnd: '',
    gender: 0,
    statusEmployee: 0,
    organization: '',
    department: '',
    district: '',
  });

  const cards = [
    {
      title: 'Total Blacklist Employee',
      icon: IconUsers,
      subTitle: `${totalFilteredRecords}`,
      subTitleSetting: 10,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;

        let employeeRes: any;
        try {
          employeeRes = await getAllEmployeeBlacklistPagination(
            token,
            start,
            rowsPerPage,
            sortDir,
            search,
            // filters.joinStart,
            // filters.exitEnd,
            true,
          );
        } catch (err: any) {
          throw err;
        }

        const safeCollection = Array.isArray(employeeRes?.collection) ? employeeRes.collection : [];
        const isNotFound =
          employeeRes?.status_code === 404 ||
          employeeRes?.status === 'not_found' ||
          safeCollection.length === 0;

        setTableData(safeCollection);
        setTotalRecords(employeeRes?.RecordsTotal ?? safeCollection.length ?? 0);
        setTotalFilteredRecords(employeeRes?.RecordsFiltered ?? safeCollection.length ?? 0);

        const rows = safeCollection.map((item: any) => ({
          id: item.id,
          name: item.employee.name,
          phone: item.employee.phone,
          email: item.employee.email,
          gender: item.employee.gender,
          reason: item.reason || '-',
        }));
        setTableRowEmployee(rows);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, refreshTrigger, search]);

  const handleSearch = useCallback(
    (keyword: string) => {
      setPage(0);
      setSearch(keyword);
    },
    [setPage, setSearch],
  );

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Employee" description="this is Employee page">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableRowEmployee}
                selectedRows={selectedRows}
                totalCount={totalFilteredRecords}
                isHaveChecked={true}
                isNoActionTableHead
                isHaveAction={false}
                isHaveSearch={true}
                isHaveImage={true}
                isHaveFilter={false}
                isHaveExportPdf={false}
                isHavePagination={true}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 50, 100]}
                currentPage={page}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveExportXlf={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveFilterMore={false}
                isHaveHeader={false}
                onCheckedChange={(selected) => {
                  const fullSelectedItems = tableData.filter((item) =>
                    selected.some((row: EmployeesTableRow) => row.id === item.id),
                  );
                  setSelectedRows(fullSelectedItems);
                }}
                searchKeyword={search}
                onSearch={handleSearch}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
