import React from 'react';
import { Printer, Text, Line, Br, QRCode, Cut } from 'react-thermal-printer';
import { formatDateTime } from 'src/utils/formatDatePeriodEnd';

const BadgePrinter = ({ printData, invitationData }: any) => {
  return (
    <Printer type="epson" width={printData.printer_paper_size || 58}>
      <Text>Name</Text>
      <Text>{invitationData?.visitor_name ?? '-'}</Text>
      <Text>{invitationData?.visitor_phone ?? '-'}</Text>

      <Br />

      <Text>Organization / Company</Text>
      <Text>{invitationData?.visitor_organization_name ?? '-'}</Text>

      <Line />

      <Text align="center">{invitationData?.site_place_name ?? '-'}</Text>

      <Br />

      {/* <QRCode value={invitationData?.invitation_code ?? '-'} size={6} /> */}

      <Br />

      <Text align="center">Show this while visiting</Text>

      <Text align="center">ID : {invitationData?.visitor_code ?? '-'}</Text>

      <Line />

      <Text>Agenda</Text>
      <Text>{invitationData?.agenda ?? '-'}</Text>

      <Text>Host</Text>
      <Text>{invitationData?.host_name ?? '-'}</Text>

      <Br />

      <Text>Arrive</Text>
      <Text>{formatDateTime(invitationData?.visitor_period_start) ?? '-'}</Text>

      <Text>Until</Text>
      <Text>{formatDateTime(invitationData?.visitor_period_end) ?? '-'}</Text>

      <Br />

      <Line />

      <Text align="center">{printData.footer_text}</Text>

      <Cut />
    </Printer>
  );
};

export default BadgePrinter;
