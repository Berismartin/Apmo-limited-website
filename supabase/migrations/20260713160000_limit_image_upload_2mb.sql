-- Enforce 2 MB max for admin image uploads in apmo_bucket
update storage.buckets
set file_size_limit = 2097152
where id = 'apmo_bucket';
