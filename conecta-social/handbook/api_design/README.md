# API Design (OpenAPI + AsyncAPI)

Scope: use OpenAPI for HTTP request/response APIs and AsyncAPI for async/event-driven APIs. This document is the base design guideline and embeds the chosen baseline specs.

## Decision
- Use OpenAPI 3.1 as the base contract for HTTP APIs.
- Use AsyncAPI 3.0 as the base contract for async/event APIs.
- Use the API_DESIGN ruleset as governance for method/status/error conventions.

## When to use OpenAPI vs AsyncAPI
| Use case | Spec |
| --- | --- |
| HTTP request/response endpoints (REST/RPC) | OpenAPI |
| Pub/Sub, queues, streams, WebSocket events | AsyncAPI |

## HTTP Status Reference (summary)
Use the HTTP status codes below as baseline meanings when modeling responses:
- 200 OK: request succeeded; semantics depend on method (GET/HEAD/PUT/POST/TRACE).
- 201 Created: request succeeded and a new resource was created.
- 202 Accepted: request received, processing is async or deferred.
- 204 No Content: request succeeded, no response body.
- 400 Bad Request: client error (malformed request).
- 401 Unauthorized: unauthenticated client.
- 403 Forbidden: authenticated but not authorized.
- 404 Not Found: resource not found or hidden.
- 405 Method Not Allowed: method not supported by the target resource.
- 409 Conflict: request conflicts with current state.
- 422 Unprocessable Content: semantic errors in well-formed request.
- 429 Too Many Requests: rate limit exceeded.
- 500 Internal Server Error: server error.
- 503 Service Unavailable: temporary overload or maintenance.

## OPEN_API (baseline)
```yaml
openapi: 3.1.0
info:
  title: Swagger Petstore - OpenAPI 3.1
  description: |-
    This is a sample Pet Store Server based on the OpenAPI 3.1 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)

  termsOfService: https://swagger.io/terms/
  contact:
    email: apiteam@swagger.io
  license:
    name: Apache 2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 1.0.12
externalDocs:
  description: Find out more about Swagger
  url: https://swagger.io
servers:
  - url: https://petstore31.swagger.io/api/v3
tags:
  - name: pet
    description: Everything about your Pets
    externalDocs:
      description: Find out more
      url: http://swagger.io
  - name: store
    description: Access to Petstore orders
    externalDocs:
      description: Find out more about our store
      url: http://swagger.io
  - name: user
    description: Operations about user
paths:
  /pet:
    put:
      tags:
        - pet
      summary: Update an existing pet.
      description: Update an existing pet by Id.
      operationId: updatePet
      requestBody:
        description: Update an existent pet in the store
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
          application/xml:
            schema:
              $ref: '#/components/schemas/Pet'
          application/x-www-form-urlencoded:
            schema:
              $ref: '#/components/schemas/Pet'
        required: true
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
        '422':
          description: Validation exception
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
    post:
      tags:
        - pet
      summary: Add a new pet to the store.
      description: Add a new pet to the store.
      operationId: addPet
      requestBody:
        description: Create a new pet in the store
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Pet'
          application/xml:
            schema:
              $ref: '#/components/schemas/Pet'
          application/x-www-form-urlencoded:
            schema:
              $ref: '#/components/schemas/Pet'
        required: true
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
        '400':
          description: Invalid input
        '422':
          description: Validation exception
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
  /pet/findByStatus:
    get:
      tags:
        - pet
      summary: Finds Pets by status.
      description: Multiple status values can be provided with comma separated strings.
      operationId: findPetsByStatus
      parameters:
        - name: status
          in: query
          description: Status values that need to be considered for filter
          required: false
          explode: true
          schema:
            type: string
            default: available
            enum:
              - available
              - pending
              - sold
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
            application/xml:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
        '400':
          description: Invalid status value
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
  /pet/findByTags:
    get:
      tags:
        - pet
      summary: Finds Pets by tags.
      description: Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
      operationId: findPetsByTags
      parameters:
        - name: tags
          in: query
          description: Tags to filter by
          required: false
          explode: true
          schema:
            type: array
            items:
              type: string
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
            application/xml:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
        '400':
          description: Invalid tag value
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
  /pet/{petId}:
    get:
      tags:
        - pet
      summary: Find pet by identifier.
      description: Returns a single pet.
      operationId: getPetById
      parameters:
        - name: petId
          in: path
          description: ID of pet to return
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - api_key: []
        - petstore_auth:
            - write:pets
            - read:pets
    post:
      tags:
        - pet
      summary: Updates a pet in the store with form data.
      description: update a pet via the form data.
      operationId: updatePetWithForm
      parameters:
        - name: petId
          in: path
          description: ID of pet that needs to be updated
          required: true
          schema:
            type: integer
            format: int64
        - name: name
          in: query
          description: Name of pet that needs to be updated
          schema:
            type: string
        - name: status
          in: query
          description: Status of pet that needs to be updated
          schema:
            type: string
      responses:
        '200':
          description: successfully updated
        '400':
          description: Invalid input
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
    delete:
      tags:
        - pet
      summary: Deletes a pet.
      description: delete a pet.
      operationId: deletePet
      parameters:
        - name: api_key
          in: header
          description: ''
          required: false
          schema:
            type: string
        - name: petId
          in: path
          description: Pet id to delete
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: successful operation
        '400':
          description: Invalid pet value
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
  /pet/{petId}/uploadImage:
    post:
      tags:
        - pet
      summary: Uploads an image.
      description: Upload an image of pet.
      operationId: uploadFile
      parameters:
        - name: petId
          in: path
          description: ID of pet to update
          required: true
          schema:
            type: integer
            format: int64
        - name: additionalMetadata
          in: query
          description: Additional Metadata
          required: false
          schema:
            type: string
      requestBody:
        content:
          application/octet-stream:
            schema:
              type: string
              format: binary
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - petstore_auth:
            - write:pets
            - read:pets
  /store/inventory:
    get:
      tags:
        - store
      summary: Returns pet inventories by status.
      description: Returns a map of status codes to quantities.
      operationId: getInventory
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                type: object
                additionalProperties:
                  type: integer
                  format: int32
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
      security:
        - api_key: []
  /store/order:
    post:
      tags:
        - store
      summary: Place an order for a pet.
      description: Place a new order in the store.
      operationId: placeOrder
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Order'
          application/xml:
            schema:
              $ref: '#/components/schemas/Order'
          application/x-www-form-urlencoded:
            schema:
              $ref: '#/components/schemas/Order'
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          description: Invalid input
        '422':
          description: Validation exception
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /store/order/{orderId}:
    get:
      tags:
        - store
      summary: Find purchase order by identifier.
      description: For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.
      operationId: getOrderById
      parameters:
        - name: orderId
          in: path
          description: ID of order that needs to be fetched
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
            application/xml:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          description: Invalid ID supplied
        '404':
          description: Order not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    delete:
      tags:
        - store
      summary: Delete purchase order by identifier.
      description: For valid response try integer IDs with value < 1000. Anything above 1000 or non-integers will generate API errors.
      operationId: deleteOrder
      parameters:
        - name: orderId
          in: path
          description: ID of the order that needs to be deleted
          required: true
          schema:
            type: integer
            format: int64
      responses:
        '200':
          description: successful operation
        '400':
          description: Invalid ID supplied
        '404':
          description: Order not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /user:
    post:
      tags:
        - user
      summary: Create user.
      description: This can only be done by the logged in user.
      operationId: createUser
      requestBody:
        description: Created user object
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
          application/xml:
            schema:
              $ref: '#/components/schemas/User'
          application/x-www-form-urlencoded:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
            application/xml:
              schema:
                $ref: '#/components/schemas/User'
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /user/createWithList:
    post:
      tags:
        - user
      summary: Creates list of users with given input array.
      description: Creates list of users with given input array.
      operationId: createUsersWithListInput
      requestBody:
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/User'
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
            application/xml:
              schema:
                $ref: '#/components/schemas/User'
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /user/login:
    get:
      tags:
        - user
      summary: Logs user into the system.
      description: log user into the system.
      operationId: loginUser
      parameters:
        - name: username
          in: query
          description: The user name for login
          required: false
          schema:
            type: string
        - name: password
          in: query
          description: The password for login in clear text
          required: false
          schema:
            type: string
      responses:
        '200':
          description: successful operation
          headers:
            X-Rate-Limit:
              description: calls per hour allowed by the user
              schema:
                type: integer
                format: int32
            X-Expires-After:
              description: date in UTC when token expires
              schema:
                type: string
                format: date-time
          content:
            application/xml:
              schema:
                type: string
            application/json:
              schema:
                type: string
        '400':
          description: Invalid username/password supplied
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
  /user/logout:
    get:
      tags:
        - user
      summary: Logs out current logged in user session.
      description: Log user out of system.
      operationId: logoutUser
      parameters: []
      responses:
        '200':
          description: successful operation
        default:
          description: successful operation
  /user/{username}:
    get:
      tags:
        - user
      summary: Get user by user name.
      description: Get user details based on username.
      operationId: getUserByName
      parameters:
        - name: username
          in: path
          description: The name that needs to be fetched. Use user1 for testing
          required: true
          schema:
            type: string
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
            application/xml:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid username supplied
        '404':
          description: User not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    put:
      tags:
        - user
      summary: Update user.
      description: This can only be done by the logged in user.
      operationId: updateUser
      parameters:
        - name: username
          in: path
          description: name that need to be deleted
          required: true
          schema:
            type: string
      requestBody:
        description: Update an existent user in the store
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
          application/xml:
            schema:
              $ref: '#/components/schemas/User'
          application/x-www-form-urlencoded:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: successful operation
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    delete:
      tags:
        - user
      summary: Delete user.
      description: This can only be done by the logged in user.
      operationId: deleteUser
      parameters:
        - name: username
          in: path
          description: The name that needs to be deleted
          required: true
          schema:
            type: string
      responses:
        '200':
          description: successful operation
        '400':
          description: Invalid username supplied
        '404':
          description: User not found
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Order:
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [10]
        petId:
          type: integer
          format: int64
          examples: [198772]
        quantity:
          type: integer
          format: int32
          examples: [7]
        shipDate:
          type: string
          format: date-time
        status:
          type: string
          description: Order Status
          examples: [approved]
          enum:
            - placed
            - approved
            - delivered
        complete:
          type: boolean
      xml:
        name: order
    Customer:
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [100000]
        username:
          type: string
          examples: [fehguy]
        address:
          type: array
          xml:
            name: addresses
            wrapped: true
          items:
            $ref: '#/components/schemas/Address'
      xml:
        name: customer
    Address:
      type: object
      properties:
        street:
          type: string
          examples: [437 Lytton]
        city:
          type: string
          examples: [Palo Alto]
        state:
          type: string
          examples: [CA]
        zip:
          type: string
          examples: ['94301']
      xml:
        name: address
    Category:
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [1]
        name:
          type: string
          examples: [Dogs]
      xml:
        name: category
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [10]
        username:
          type: string
          examples: [theUser]
        firstName:
          type: string
          examples: [John]
        lastName:
          type: string
          examples: [James]
        email:
          type: string
          examples: [john@email.com]
        password:
          type: string
          examples: ['12345']
        phone:
          type: string
          examples: ['12345']
        userStatus:
          type: integer
          description: User Status
          format: int32
          examples: [1]
      xml:
        name: user
    Tag:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
      xml:
        name: tag
    Pet:
      required:
        - name
        - photoUrls
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [10]
        name:
          type: string
          examples: [doggie]
        category:
          $ref: '#/components/schemas/Category'
        photoUrls:
          type: array
          xml:
            wrapped: true
          items:
            type: string
            xml:
              name: photoUrl
        tags:
          type: array
          xml:
            wrapped: true
          items:
            $ref: '#/components/schemas/Tag'
        status:
          type: string
          description: pet status in the store
          enum:
            - available
            - pending
            - sold
      xml:
        name: pet
    ApiResponse:
      type: object
      properties:
        code:
          type: integer
          format: int32
        type:
          type: string
        message:
          type: string
      xml:
        name: '##default'
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
      required:
        - code
        - message
  requestBodies:
    Pet:
      description: Pet object that needs to be added to the store
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Pet'
        application/xml:
          schema:
            $ref: '#/components/schemas/Pet'
    UserArray:
      description: List of user object
      content:
        application/json:
          schema:
            type: array
            items:
              $ref: '#/components/schemas/User'
  securitySchemes:
    petstore_auth:
      type: oauth2
      flows:
        implicit:
          authorizationUrl: https://petstore3.swagger.io/oauth/authorize
          scopes:
            "write:pets": modify pets in your account
            "read:pets": read your pets
    api_key:
      type: apiKey
      name: api_key
      in: header
```

## ASYNCAPI (baseline)
```yaml
asyncapi: 3.0.0
info:
  title: Petstore
  version: 1.0.0
  description: The PetStore running in Kafka
channels:
  petstore.order.added:
    address: petstore.order.added
    messages:
      publish.message:
        title: New order for pet
        summary: A new order for a pet was added.
        name: Order
        contentType: application/json
        payload:
          $ref: '#/components/schemas/Order'
  petstore.order.deleted:
    address: petstore.order.deleted
    messages:
      publish.message:
        name: OrderId
        contentType: application/json
        payload:
          type: integer
          format: int64
  petstore.pet.added:
    address: petstore.pet.added
    messages:
      publish.message:
        name: Pet
        contentType: application/json
        payload:
          $ref: '#/components/schemas/Pet'
  petstore.pet.changed:
    address: petstore.pet.changed
    messages:
      publish.message:
        name: Pet
        contentType: application/json
        payload:
          $ref: '#/components/schemas/Pet'
  petstore.pet.deleted:
    address: petstore.pet.deleted
    messages:
      publish.message:
        name: PetId
        contentType: application/json
        payload:
          type: integer
          format: int64
operations:
  petstore.order.added.publish:
    action: receive
    channel:
      $ref: '#/channels/petstore.order.added'
    messages:
      - $ref: '#/channels/petstore.order.added/messages/publish.message'
  petstore.order.deleted.publish:
    action: receive
    channel:
      $ref: '#/channels/petstore.order.deleted'
    messages:
      - $ref: '#/channels/petstore.order.deleted/messages/publish.message'
  petstore.pet.added.publish:
    action: receive
    channel:
      $ref: '#/channels/petstore.pet.added'
    messages:
      - $ref: '#/channels/petstore.pet.added/messages/publish.message'
  petstore.pet.changed.publish:
    action: receive
    channel:
      $ref: '#/channels/petstore.pet.changed'
    messages:
      - $ref: '#/channels/petstore.pet.changed/messages/publish.message'
  petstore.pet.deleted.publish:
    action: receive
    channel:
      $ref: '#/channels/petstore.pet.deleted'
    messages:
      - $ref: '#/channels/petstore.pet.deleted/messages/publish.message'
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
    Order:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 10
        petId:
          type: integer
          format: int64
          example: 198772
        quantity:
          type: integer
          format: int32
          example: 7
        shipDate:
          type: string
          format: date-time
        status:
          type: string
          description: Order Status
          example: approved
          enum:
            - placed
            - approved
            - delivered
        complete:
          type: boolean
      xml:
        name: order
    Customer:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 100000
        username:
          type: string
          example: fehguy
        address:
          type: array
          xml:
            name: addresses
            wrapped: true
          items:
            $ref: '#/components/schemas/Address'
      xml:
        name: customer
    Address:
      type: object
      properties:
        street:
          type: string
          example: 437 Lytton
        city:
          type: string
          example: Palo Alto
        state:
          type: string
          example: CA
        zip:
          type: string
          example: '94301'
      xml:
        name: address
    Category:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 1
        name:
          type: string
          example: Dogs
      xml:
        name: category
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 10
        username:
          type: string
          example: theUser
        firstName:
          type: string
          example: John
        lastName:
          type: string
          example: James
        email:
          type: string
          example: john@email.com
        password:
          type: string
          example: '12345'
        phone:
          type: string
          example: '12345'
        userStatus:
          type: integer
          description: User Status
          format: int32
          example: 1
      xml:
        name: user
    Tag:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
      xml:
        name: tag
    Pet:
      required:
        - name
        - photoUrls
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 10
        name:
          type: string
          example: doggie
        category:
          $ref: '#/components/schemas/Category'
        photoUrls:
          type: array
          xml:
            wrapped: true
          items:
            type: string
            xml:
              name: photoUrl
        tags:
          type: array
          xml:
            wrapped: true
          items:
            $ref: '#/components/schemas/Tag'
        status:
          type: string
          description: pet status in the store
          enum:
            - available
            - pending
            - sold
      xml:
        name: pet
    ApiResponse:
      type: object
      properties:
        code:
          type: integer
          format: int32
        type:
          type: string
        message:
          type: string
      xml:
        name: '##default'
```

## API_DESIGN (governance ruleset)
```yaml
version: '2021-05-07'
info:
  title: SmartBear API Guidelines
  description: |
    A machine and human readable version of the SmartBear API Style Guide aimed at promoting living API Style Governance across various tools and teams, leading to improved API quality.
    See the [SmartBear Standards and Guidelines](https://github.com/SmartBear/api-standards-and-guidelines) repo for a traditional view of the static guidelines.
principles:
- iri: urn:apidesign.systems:principle:robustness
  level: must
- iri: urn:apidesign.systems:principle:rmm:level2
  level: must
- iri: urn:apidesign.systems:principle:rmm:level3
  level: should
standards:
- iri: urn:ietf:rfc:6648
  level: must
- iri: urn:ietf:rfc:7807
  level: must
- iri: urn:ietf:rfc:7231
  level: should
- iri: urn:ietf:rfc:6585
  level: may
- iri: urn:ietf:rfc:5788
  level: may
- iri: urn:ietf:draft:http-semantics
  level: may
scenarios:
- description: SB-API-010 - Only apply standard HTTP methods
  when:
  - http
  - transaction
  then:
  - subject:
    - http
    - request
    - method
    level: may
    values:
    - get
    - post
    - put
    - patch
    - delete
  - subject:
    - http
    - request
    - header
    level: may
    values:
    - Accept
    - Accept-Charset
    - Authorization
    - Content-Language
    - Content-Type
    - Link
    - Prefer
  - subject:
    - http
    - request
    - header
    - Content-Type
    level: may
    values:
    - application/json
    - application/hal+json
  - subject:
    - http
    - response
    - header
    - Content-Type
    level: should
    values:
    - application/hal+json
  - subject:
    - http
    - response
    - header
    - Content-Type
    level: may
    values:
    - application/json
    - application/hal+json
    - application/problem+json
- description: GET Methods - Allowed status codes
  when:
  - http
  - request
  - method
  - get
  then:
  - subject:
    - http
    - response
    - status_code
    level: may
    values:
    - '200'
    - '304'
    - '400'
    - '401'
    - '403'
    - '404'
    - '405'
    - '422'
    - '429'
    - '500'
    - '501'
    - '503'
- description: POST Method - Allowed status codes
  when:
  - http
  - request
  - method
  - post
  then:
  - subject:
    - http
    - response
    - status_code
    level: may
    values:
    - '200'
    - '201'
    - '202'
    - '400'
    - '401'
    - '403'
    - '404'
    - '405'
    - '409'
    - '415'
    - '422'
    - '429'
    - '500'
    - '501'
    - '503'
- description: PUT Method - Allowed status codes
  when:
  - http
  - request
  - method
  - put
  then:
  - subject:
    - http
    - response
    - status_code
    level: may
    values:
    - '200'
    - '201'
    - '202'
    - '204'
    - '400'
    - '401'
    - '403'
    - '404'
    - '405'
    - '409'
    - '412'
    - '415'
    - '422'
    - '429'
    - '500'
    - '501'
    - '503'
- description: PATCH Method - Allowed status codes
  when:
  - http
  - request
  - method
  - patch
  then:
  - subject:
    - http
    - response
    - status_code
    level: may
    values:
    - '200'
    - '202'
    - '204'
    - '400'
    - '401'
    - '403'
    - '404'
    - '405'
    - '409'
    - '412'
    - '415'
    - '422'
    - '429'
    - '500'
    - '501'
    - '503'
- description: DELETE Method - Allowed status codes
  when:
  - http
  - request
  - method
  - delete
  then:
  - subject:
    - http
    - response
    - status_code
    level: may
    values:
    - '200'
    - '202'
    - '204'
    - '400'
    - '401'
    - '403'
    - '404'
    - '405'
    - '409'
    - '412'
    - '415'
    - '422'
    - '429'
    - '500'
    - '501'
    - '503'
- description: Client Errors must return `application/problem+json`
  when:
  - http
  - response
  - status_code
  - client_error
  then:
  - subject:
    - http
    - response
    - header
    - Content-Type
    level: must
    values:
    - application/problem+json
- description: Server Errors must return `application/problem+json`
  when:
  - http
  - response
  - status_code
  - server_error
  then:
  - subject:
    - http
    - response
    - header
    - Content-Type
    level: must
    values:
    - application/problem+json
```
