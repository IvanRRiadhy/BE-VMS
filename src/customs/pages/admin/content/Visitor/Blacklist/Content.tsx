import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid2 as Grid } from '@mui/material';
import Container from 'src/components/container/PageContainer';
import PageContainer from 'src/customs/components/container/PageContainer';
import {
  AdminCustomSidebarItemsData,
  AdminNavListingData,
} from 'src/customs/components/header/navigation/AdminMenu';

import TopCard from 'src/customs/components/cards/TopCard';
import { DynamicTable } from 'src/customs/components/table/DynamicTable';
import { useSession } from 'src/customs/contexts/SessionContext';
import { getBlacklistDt, getListVisitor } from 'src/customs/api/admin';
import { IconForbid, IconScript } from '@tabler/icons-react';
import FilterBlacklist from './FilterBlacklist';

const Content = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { token } = useSession();
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [loading, setLoading] = useState(false);
  const [edittingId, setEdittingId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalFilteredRecords, setTotalFilteredRecords] = useState(0);
  const [sortDir, setSortDir] = useState('desc');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [totalActive, setTotalActive] = useState(0);
  const [totalNonActive, setTotalNonActive] = useState(0);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorSearch, setVisitorSearch] = useState('');

  const cards = [
    {
      title: 'Total Blacklist',
      subTitle: `${totalRecords}`,
      subTitleSetting: 10,
      icon: IconForbid,
      color: 'none',
    },
    {
      title: 'Active Blacklist',
      subTitle: `${totalActive}`,
      subTitleSetting: 10,
      icon: IconForbid,
      color: 'none',
    },
    {
      title: 'Nonactive Blacklist',
      subTitle: `${totalNonActive}`,
      subTitleSetting: 10,
      icon: IconForbid,
      color: 'none',
    },
  ];

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const start = page * rowsPerPage;
        const response = await getBlacklistDt(
          token,
          start,
          sortDir,
          rowsPerPage,
          searchKeyword || '',
          filters.start_date || '',
          filters.end_date || '',
          filters.visitors || '',
          filters.status_blacklist,
        );

        const collection = response.collection || [];

        let rows = response.collection.map((item: any) => {
          return {
            id: item.id,
            name: item.visitor.name || '-',
            phone: item.visitor.phone || '-',
            reason: item.reason || '-',
            is_active: item.is_active,
            approved_by: item.approved_by_name || '-',
          };
        });

        setTotalActive(collection.filter((x: any) => x.is_active === true).length);
        setTotalNonActive(collection.filter((x: any) => x.is_active === false).length);

        setTableData(rows);
        setTotalRecords(response.RecordsTotal);
        setTotalFilteredRecords(response.RecordsFiltered);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, page, rowsPerPage, sortColumn, sortDir, refreshTrigger, searchKeyword]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getListVisitor(token as any);
      setVisitors(res.collection);
    };

    fetchData();
  }, [token]);

  const [filters, setFilters] = useState<any>({
    start_date: '',
    end_date: '',
    visitor: '',
    status_blacklist: '',
  });

  const handleApplyFilter = () => {
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleResetFilter = () => {
    const empty = {
      start_date: '',
      end_date: '',
      visitor: '',
      status_blacklist: '',
    };

    setFilters(empty);
    setPage(0);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <PageContainer
      itemDataCustomNavListing={AdminNavListingData}
      itemDataCustomSidebarItems={AdminCustomSidebarItemsData}
    >
      <Container title="Blacklist" description="Blacklist page">
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 12 }}>
              <TopCard items={cards} size={{ xs: 12, lg: 4 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
              <DynamicTable
                loading={loading}
                overflowX={'auto'}
                data={tableData}
                isHavePagination={true}
                selectedRows={selectedRows}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100, 500]}
                onPaginationChange={(page, rowsPerPage) => {
                  setPage(page);
                  setRowsPerPage(rowsPerPage);
                }}
                isHaveChecked={true}
                isHaveAction={false}
                isHaveSearch={true}
                isHaveFilter={false}
                isHaveFilterDuration={false}
                isHaveAddData={false}
                isHaveFilterMore={true}
                isHaveHeader={false}
                onCheckedChange={(selected) => setSelectedRows(selected)}
                onSearchKeywordChange={(keyword) => setSearchKeyword(keyword)}
                filterMoreContent={
                  <FilterBlacklist
                    filters={filters}
                    setFilters={setFilters}
                    onApplyFilter={handleApplyFilter}
                    onResetFilter={handleResetFilter}
                    visitors={visitors}
                  />
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Content;
