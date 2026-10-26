import { useQuery } from '@tanstack/react-query';
import {
    getAllCustomField,
    // getAllCustomFieldPagination,
} from 'src/customs/api/admin';
import { FieldType, Item } from 'src/customs/api/models/Admin/CustomField';

interface Props {
    page: number;
    rowsPerPage: number;
    search: string;
    sortDir?: string;
}

export const CUSTOM_FIELD_QUERY_KEY = ['custom-field'];

const useCustomFieldPagination = ({
    page,
    rowsPerPage,
    search,
    sortDir = 'desc',
}: Props) => {
    return useQuery({
        queryKey: [...CUSTOM_FIELD_QUERY_KEY, page, rowsPerPage, search, sortDir],

        queryFn: async () => {
            // jika nanti backend sudah support pagination tinggal ganti API di sini
            // const start = page * rowsPerPage;
            // const response = await getAllCustomFieldPagination(
            //   start,
            //   rowsPerPage,
            //   sortDir,
            //   search,
            // );

            const response = await getAllCustomField();

            const collection = response.collection
                .filter((item: Item) => {
                    if (!search) return true;

                    const keyword = search.toLowerCase();

                    return (
                        item.short_name?.toLowerCase().includes(keyword) ||
                        item.long_display_text?.toLowerCase().includes(keyword) ||
                        FieldType[item.field_type]?.toLowerCase().includes(keyword)
                    );
                })
                .map((item: Item) => ({
                    id: item.id,
                    name: item.short_name,
                    display_text: item.long_display_text,
                    remarks: item.remarks,
                    field_type: FieldType[item.field_type],
                    multiple_option_fields: item.multiple_option_fields,
                }));

            return {
                collection,
                totalRecords: response.collection.length,
                totalFiltered: collection.length,
            };
        },

        placeholderData: (prev) => prev,
    });
};

export default useCustomFieldPagination;