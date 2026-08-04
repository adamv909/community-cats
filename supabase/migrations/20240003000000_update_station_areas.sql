-- Update station area names to use cluster letters
update public.stations set area = 'Cluster R' where id in (
  '11111111-0001-0001-0001-000000000001',
  '11111111-0001-0001-0001-000000000002'
);
update public.stations set area = 'Cluster Q' where id in (
  '11111111-0001-0001-0001-000000000003',
  '11111111-0001-0001-0001-000000000004',
  '11111111-0001-0001-0001-000000000005'
);
update public.stations set area = 'Cluster P' where id in (
  '11111111-0001-0001-0001-000000000006',
  '11111111-0001-0001-0001-000000000007'
);
update public.stations set area = 'Cluster S' where id in (
  '11111111-0001-0001-0001-000000000008',
  '11111111-0001-0001-0001-000000000009',
  '11111111-0001-0001-0001-000000000010'
);
