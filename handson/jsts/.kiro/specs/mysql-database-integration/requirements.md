# Requirements Document

## Introduction

This feature replaces the in-memory data layer of the Awesome Pizza API with a MySQL-backed data layer. The `dailyMenu` and `orders` collections currently held in memory (`src/api/database.ts`) will be persisted in MySQL tables. The existing data-access helper functions (`findOrderById`, `addOrder`, `updateOrderById`, `deleteOrderById`, `generateOrderId`, and menu retrieval) keep their signatures so route handlers in `src/api/server.ts` continue to work without change, and the public API behavior is preserved.

## Glossary

- **Data_Layer**: The module (`src/api/database.ts`) that exposes data-access helper functions to route handlers.
- **MySQL_Store**: The MySQL database that persists menu entries and orders.
- **Connection_Pool**: The pooled set of MySQL connections used by the Data_Layer to run queries.
- **Menu_Entry**: A pizza menu record with `name`, `description`, and `imageUrl`.
- **Order**: An order record with `id`, `sender`, `status`, and `contents`, where status is one of `RECEIVED`, `DELIVERING`, `DELIVERED`, `CANCELED`.
- **Order_Item**: An element of an Order's contents with `name` and `quantity`.

## Requirements

### Requirement 1: Database Connection

**User Story:** As an operator, I want the API to connect to MySQL using configurable settings, so that data persists outside of process memory.

#### Acceptance Criteria

1. WHEN the application starts, THE Data_Layer SHALL create a Connection_Pool to the MySQL_Store using host, port, user, password, and database name read from environment variables.
2. WHERE any of the host, port, user, password, or database environment variables is not set, THE Data_Layer SHALL use a documented default value for that specific setting and proceed with Connection_Pool creation.
3. IF the Connection_Pool cannot establish a connection to the MySQL_Store within a connection timeout of 10 seconds, THEN THE Data_Layer SHALL surface an error to the caller that indicates the connection failure.
4. WHEN the Data_Layer surfaces a connection failure error, THE Data_Layer SHALL abort application startup rather than serve requests against an unavailable MySQL_Store.

### Requirement 2: Schema and Seed Data

**User Story:** As a developer, I want the menu and order tables to exist with initial data, so that the API behaves the same as the current in-memory version.

#### Acceptance Criteria

1. THE MySQL_Store SHALL provide a menu table with columns for name, description, and imageUrl; an order table with columns for id, sender, and status; and an order_item table with columns for name and quantity linked to a parent order.
2. THE MySQL_Store SHALL constrain the order status value to one of RECEIVED, DELIVERING, DELIVERED, or CANCELED.
3. THE MySQL_Store SHALL associate each Order_Item record with the Order to which it belongs, so that an Order's contents are the Order_Item records linked to that Order.
4. WHEN the schema is initialized on an empty MySQL_Store, THE Data_Layer SHALL seed the five current menu entries and the three current seed orders from the original in-memory `database.ts`.
5. WHEN initialization runs against a non-empty MySQL_Store, THE Data_Layer SHALL seed no data and SHALL leave existing records unchanged.

### Requirement 3: Retrieve Daily Menu

**User Story:** As a customer, I want to fetch the daily menu, so that I can see available pizzas.

#### Acceptance Criteria

1. WHEN the daily menu is requested, THE Data_Layer SHALL return all Menu_Entry records from the MySQL_Store, where each Menu_Entry includes its name, description, and imageUrl.
2. WHEN the daily menu is requested and no Menu_Entry records exist in the MySQL_Store, THE Data_Layer SHALL return an empty collection.
3. IF the daily menu is requested and the MySQL_Store is unreachable or the retrieval operation fails, THEN THE Data_Layer SHALL return an error result indicating the menu could not be retrieved, without returning partial Menu_Entry data.

### Requirement 4: Retrieve Order by ID

**User Story:** As a staff member, I want to look up an order by its ID, so that I can review its details.

#### Acceptance Criteria

1. WHEN an Order ID that exists is requested, THE Data_Layer SHALL return the matching Order including its id, sender, status, and contents (each Order_Item with name and quantity) from the MySQL_Store.
2. IF an Order ID that does not exist is requested, THEN THE Data_Layer SHALL return no Order (an absent/undefined result) indicating the order was not found.
3. IF an Order ID that is missing or malformed is requested, THEN THE Data_Layer SHALL return an error indicating the identifier is invalid.
4. IF the MySQL_Store is unreachable when an Order is requested, THEN THE Data_Layer SHALL return an error indicating the order could not be retrieved.

### Requirement 5: Create Order

**User Story:** As a customer, I want to place an order, so that it is recorded for fulfillment.

#### Acceptance Criteria

1. WHEN an Order is created with a valid sender and contents, THE Data_Layer SHALL persist a new Order with a generated unique ID and status RECEIVED in the MySQL_Store.
2. WHEN a new Order is persisted, THE Data_Layer SHALL return the stored Order including the generated ID.
3. IF an Order is created with an empty sender, THEN THE Data_Layer SHALL persist nothing and return an error indicating the sender is invalid.
4. IF an Order is created with empty contents or with an item that has a missing name or a non-positive quantity, THEN THE Data_Layer SHALL persist nothing and return an error indicating the contents are invalid.
5. IF persisting a new Order to the MySQL_Store fails, THEN THE Data_Layer SHALL persist nothing and return an error indicating the order could not be created.

### Requirement 6: Update Order

**User Story:** As a staff member, I want to update an order's sender, status, or contents, so that order records stay accurate.

#### Acceptance Criteria

1. WHEN a valid update is applied to an existing Order, THE Data_Layer SHALL update only the fields provided among sender, status, and contents, leave any omitted field unchanged, persist the change in the MySQL_Store, and return the updated Order.
2. IF an update targets an Order ID that does not exist, THEN THE Data_Layer SHALL return no updated Order and make no change to the MySQL_Store.
3. IF an update specifies a status value other than RECEIVED, DELIVERING, DELIVERED, or CANCELED, THEN THE Data_Layer SHALL reject the update, return no updated Order with an indication that the status is invalid, and leave the stored Order unchanged.
4. IF an update specifies contents containing an item with a missing or empty name or a quantity that is not a positive integer, THEN THE Data_Layer SHALL reject the update, return no updated Order with an indication that the contents are invalid, and leave the stored Order unchanged.
5. IF persisting the update to the MySQL_Store fails, THEN THE Data_Layer SHALL return no updated Order with an indication that the update failed and preserve the existing Order data unchanged.

### Requirement 7: Delete Order

**User Story:** As a staff member, I want to delete an order, so that obsolete records are removed.

#### Acceptance Criteria

1. WHEN a delete is requested for an existing Order, THE Data_Layer SHALL remove the Order and all of its associated Order_Item records from the MySQL_Store.
2. WHEN the Order and its Order_Item records have been removed, THE Data_Layer SHALL return a success indication confirming the Order was deleted.
3. IF a delete targets an Order ID that does not exist in the MySQL_Store, THEN THE Data_Layer SHALL return a failure indication reporting that the Order was not found and SHALL leave all stored Order and Order_Item records unchanged.
4. IF a delete request supplies a missing or malformed Order ID, THEN THE Data_Layer SHALL reject the request with an error indication reporting the invalid identifier and SHALL leave all stored Order and Order_Item records unchanged.

### Requirement 8: Preserve Helper Interface

**User Story:** As a developer, I want the data-access helper functions to keep their current signatures, so that route handlers in `server.ts` require no changes.

#### Acceptance Criteria

1. THE Data_Layer SHALL expose the helper functions `findOrderById`, `addOrder`, `updateOrderById`, `deleteOrderById`, and `generateOrderId` with the same names, parameter lists, and parameter types as the current in-memory implementation.
2. WHEN a route handler calls a Data_Layer helper, THE Data_Layer SHALL return data using the shared types `menu_entry` and `order` defined in `src/model/Model.ts`, without introducing new or renamed fields.
3. WHEN a route handler retrieves the daily menu, THE Data_Layer SHALL provide access to the daily menu as a collection of `menu_entry` items using the same access name as the current in-memory implementation.
4. WHERE a helper is converted to return a Promise, THE Data_Layer SHALL resolve that Promise to the same value shape the current synchronous helper returns for the equivalent input, and SHALL preserve the not-found return values (undefined for `findOrderById`, null for `updateOrderById`, false for `deleteOrderById`).
5. IF a helper is invoked with an order identifier that matches no existing order, THEN THE Data_Layer SHALL return the current not-found value for that helper without modifying stored orders.
