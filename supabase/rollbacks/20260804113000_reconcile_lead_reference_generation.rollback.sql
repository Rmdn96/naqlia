begin;

do $$
begin
  raise exception using
    errcode = '0A000',
    message = 'Automatic rollback is intentionally unavailable: restoring the ambiguous allocator would break production Lead creation. Roll forward with a reviewed replacement instead.';
end;
$$;

rollback;
