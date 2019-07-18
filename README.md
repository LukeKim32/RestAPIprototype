# RestAPIprototype
REST API server code for further app devlopement

Used Token for Authorization
Reference document is not created yet

Simply
The data will be transmitted in JSON object,

For registration, edition, deletion
Client needs to be assigned Token(1h availiable, JWT module),
and add on Request Header ("Authroization : Bearer "+${token})

For location edit function,
Input(Request Body) : [ { "propName" : "key", "value" : "new_value" } , .. ]
