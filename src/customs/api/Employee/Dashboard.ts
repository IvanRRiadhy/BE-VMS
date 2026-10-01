import axiosInstance from '../interceptor';

interface DashboardScheduleParams {
  startDate?: string;
  endDate?: string;
  today?: boolean;
  asInvited?: boolean;
}

// export const getDashboardSchedule = async (params?: DashboardScheduleParams): Promise<any> => {
//   try {
//     const response = await axiosInstance.get('/dashboard-visitor/my-visitor-schedule', {
//       params: {
//         'start-date': params?.startDate,
//         'end-date': params?.endDate,
//         today: params?.today,
//         'as-invited': params?.asInvited,
//       },
//     });

//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

interface DashboardScheduleParams {
  today?: boolean;
}

export const getDashboardSchedule = async (params?: DashboardScheduleParams): Promise<any> => {
  try {
    const response = await axiosInstance.get('/dashboard-visitor/my-visitor-schedule', {
      params: {
        ...(params?.today !== undefined && {
          today: params.today,
        }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTodayVisitors = async (params?: {
  today?: string;
  visitor_type?: string;
  all_visitor_type?: string;
  start?: number;
  length?: number;
  sortDir?: string;
  search?: string;
  showCheckout?: boolean;
  showBlock?: boolean;
  showExpired?: boolean;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  try {
    const response = await axiosInstance.get('/dashboard-visitor/todays-visitors', {
      headers: {
        Accept: 'application/json',
      },
      params: {
        today: params?.today,
        'start-date': params?.startDate,
        'end-date': params?.endDate,
        'visitor-type': params?.visitor_type,
        'all-visitor-type': params?.all_visitor_type,
        start: params?.start,
        length: params?.length,
        sort_dir: params?.sortDir,
        ...(params?.search?.trim() && {
          'search[value]': params.search.trim(),
        }),
        ...(params?.showCheckout !== undefined && {
          'show-checkout': params.showCheckout,
        }),
        ...(params?.showBlock !== undefined && {
          'show-block': params.showBlock,
        }),
        ...(params?.showExpired !== undefined && {
          'show-expired': params.showExpired,
        }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPendingApproval = async (options?: {
  start?: number;
  length?: number;
  sort_dir?: string;
  keyword?: string;
  entity_type?: string;
  approval_status?: string;
  entity_id?: string;
}): Promise<any> => {
  try {
    const params: any = {
      'entity-type': options?.entity_type ?? 'Invitation',
    };

    if (options?.start !== undefined) {
      params.start = options.start;
    }

    if (options?.length !== undefined) {
      params.length = options.length;
    }

    if (options?.sort_dir) {
      params.sort_dir = options.sort_dir;
    }

    if (options?.keyword) {
      params['search[value]'] = options.keyword;
    }

    if (options?.approval_status) {
      params['approval-status'] = options.approval_status;
    }

    if (options?.entity_id) {
      params['entity-id'] = options.entity_id;
    }

    const response = await axiosInstance.get(`/dashboard-visitor/pending-approval`, {
      params,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentlyVisiting = async (options?: {
  start?: number;
  length?: number;
  sort_dir?: string;
  keyword?: string;
  approval_status?: string;
  entity_id?: string;
  startDate?: string;
  endDate?: string;
  today?: string;
}): Promise<any> => {
  try {
    const params: any = {};

    if (options?.startDate) {
      params['start-date'] = options.startDate;
    }

    if (options?.endDate) {
      params['end-date'] = options.endDate;
    }

    if (options?.today) {
      params.today = options.today;
    }

    if (options?.start !== undefined) {
      params.start = options.start;
    }

    if (options?.length !== undefined) {
      params.length = options.length;
    }

    if (options?.sort_dir) {
      params.sort_dir = options.sort_dir;
    }

    if (options?.keyword) {
      params['search[value]'] = options.keyword;
    }

    if (options?.approval_status) {
      params['approval-status'] = options.approval_status;
    }

    if (options?.entity_id) {
      params['entity-id'] = options.entity_id;
    }

    const response = await axiosInstance.get('/dashboard-visitor/currently-visiting', {
      params,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
