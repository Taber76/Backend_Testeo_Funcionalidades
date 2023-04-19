# Backend-Arquitectura-Capas-Mejorada
Desafio incorporar conceptos Factory, DAO y DTO
***

## Consigna
1) Modificar la capa de persistencia incorporando los conceptos de Factory, DAO, y DTO.
2) Los DAOs deben presentar la misma interfaz hacia la lógica de negocio de nuestro servidor.
3) El DAO seleccionado (por un parámetro en línea de comandos como lo hicimos anteriormente) será devuelto por una Factory para que la capa de negocio opere con el.
4) Cada uno de estos casos de persistencia, deberán ser implementados usando el patrón singleton que impida crear nuevas instancias de estos mecanismos de acceso a los datos.
5) Comprobar que si llamo a la factory dos veces, con una misma opción elegida, devuelva la misma instancia.
6) Implementar el patrón Repository para la persistencia de productos y mensajes. **NO REQUERIDO PARA LA ENRTEGA**.


## Entrega
### Descripcion general
Se ha agregado la opcion de persistencia de datos en memoria mediante la variable de entorno **PERSISTENCE** (si la misma tiene el valor MEMORY la persistencia de datos sera en memoria, en otro caso la persistencia usara MongoDB).
El funcionamiento es el que se describe a continuacion para la persistencia de datos de productos, aplica a los tres tipos de datos que se almacenan (productos, usuarios y chat).

'./DAO/factory.js' -> devuelve el objeto **getDao** que segun el valor de la variable **persistence**, en la clave 'products' contiene el objeto 'MemoryProductDao' o 'MongoProductDao'. Utiliza el patron singleton para evitar crear multiples instancias de los objetos de datos.

'./DAO/MemoryProductDao.js' y './DAO/MongoProductDao.js' -> definen la clase y metodos del objeto **producto** para persistencia en memoria o MongoDb respectivamente.

'./DTO/productDto.js -> recibe el objeto de persistencia suministrado y define las funciones del DTO.

El resto del proceso es igual al que se venia trabajando anteriormente, por lo que las capas son las siguientes:
**DAO || DTO || Controller || Route || Server ||| Frontend**.
  
