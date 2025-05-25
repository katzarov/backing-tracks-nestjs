# Database

## Type separation

- Do not export/use entity types outside of the repository layer. Let's keep the types for the db entiteis and the types for api endpoints decoupled.
- I think probably wanna do the same for BullMQ ? TODO
- request => db: dto types will be used at controller and service levels. entity types will be used at repository level.
  If we need to do some transformation from the dto type to the entity - we will do this at the service level - but we should't really need to do that.
- db => response: entity types are used all the way from the db to the controller (and its interceptor). At controller level we check if returned enity tyeps match with the dto output types by doing a TS `satisfy` and checking at runtime with the zod interceptor.
- So basically, if I remove TypeORM and its entity types, should be easy for me to seamlessy and **safely** swtich to another ORM and its types.

# TypeORM stuff

## Typing the entity class.

- the TS types on the class variables / db fields are the ones that are going to be in the database. Also, when we read the entity - these are the types.
- the types of the construcor are for only when the entity is created innitially, like in a post. Some fields may be optional so we must allow undefined by making the fields Partial.
- the types of the update method are ones that allow some fields to be undeinfed and just upadte the others. Again, we must accept undefined by making the fields Partial.

## TypeORM handling nullable column types

- If we want different types when creating an entity via a constryctor/update method - we will provide those input types there. E.g if we pass undefined for a nullable property it will be saved as a NULL value, and when we read it, its TS type will be null.
- typerom behaviour is: if you set a prop to undefined it wont to anything(preserving any current data), if you set it to null then it will set it to null.
  https://github.com/typeorm/typeorm/issues/2934#issuecomment-619370573

- so for a nullabe column - when we create a row of such an enitty. If we provide either undeinfed or null => saved as null in DB.
- Later on, if we provide undefiend for this nullable col, typeorm wont change it, no matter the current value.
- If we provide null on the other hand, then typorom will set it to NULL

## Gotchas

When I tell TS this is `string | null`, (I think understandably), TypeORM cannot infer correctly what the col type is, so we need to specify it. Otherwise you will waste time debugging!

BAD:
`@Column({ nullable: true })`
`description: string | null;`

GOOD:
`@Column('varchar', { nullable: true })`
`description: string | null;`
