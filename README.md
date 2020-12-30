# Backend

## User Entity

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)
- restaurants(foreign key)

## Restaurant Entity

- name
- category(foreign key)
- owner(foreign key)
- address
- coverImage

## Category Entity

- name
- slug
- restaurants(foreign key)

## Order Entity
