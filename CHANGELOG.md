## V 3.0.0-beta

- remove parser() function
- remove join() and schema() functions
- update type definitions
- rename string(), number(), boolean() and array() to text(), float(), bool() and list() to prevent collitions with reserved words
- fix() never fails. It can always fix data