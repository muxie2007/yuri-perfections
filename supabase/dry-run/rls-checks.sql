-- Access checks after the admin migration: run as visitor, inactive user, admin, super admin.
-- Expected results are noted inline. See supabase/dry-run/README.md.
\set ON_ERROR_STOP 0
-- users: admin via app_metadata, super admin, and a random signup
insert into auth.users (id,email,raw_app_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','admin@x.com','{"role":"admin"}'),
 ('00000000-0000-0000-0000-00000000000b','super@x.com','{"role":"super_admin"}'),
 ('00000000-0000-0000-0000-00000000000c','rando@x.com','{}');
select email, role, is_active from public.profiles order by email;
select name from project_categories order by "order";
select slug, category, featured from projects order by id;
update projects set status='inactive' where slug='c';

\echo '== ANON'
set role anon; select set_config('request.jwt.claim.sub','',false);
select count(*) as anon_projects_visible from projects;
select count(*) as anon_msgs_visible from contact_messages;
insert into contact_messages (name,email,message) values ('Visitor','v@x.com','hello');
\echo 'anon insert done (expect ok above)'
insert into contact_messages (name,email,message,status) values ('Sneaky','v@x.com','hi','read');
\echo '(expect RLS error above)'
update projects set title='hacked';
select title from projects where slug='a';
insert into projects (slug,title,category) values ('z','Z','Residential');
\echo '(expect error above)'
reset role;

\echo '== RANDOM SIGNUP (inactive)'
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000c',false);
select count(*) as rando_msgs from contact_messages;
update projects set title='hacked2' returning id;
select count(*) as rando_profiles from profiles;
reset role;

\echo '== ADMIN'
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000a',false);
select count(*) as admin_projects_incl_inactive from projects;
select count(*) as admin_msgs from contact_messages;
update contact_messages set status='read', read_at=now() returning id, status;
update projects set featured=true where slug='b' returning slug;
update project_categories set name='Homes' where name='Residential';
select slug, category from projects order by id;
delete from project_categories where name='Commercial';
\echo '(expect FK restrict error above)'
select count(*) as admin_profiles_visible from profiles;
update profiles set role='super_admin' where email='admin@x.com' returning id;
\echo '(expect 0 rows: admin cannot promote self)'
update site_settings set phone='+256700000000' returning phone;
select 1;
reset role;

\echo '== SUPER ADMIN'
set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000000b',false);
select count(*) as super_profiles_visible from profiles;
update profiles set is_active=true where email='rando@x.com' returning email, is_active;
reset role;
