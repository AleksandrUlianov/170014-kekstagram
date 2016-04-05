/**
 * Created by Aleksandr Ulianov on 30.03.2016.
 */
//--> function to check smth from incoming parameters
var getMessage = function(a,b) {
  var returnMessage = "Загружается объект неизвестного вида " + typeof(a);

  //-->check the existence of input parameters
  if (typeof(a) == "undefined") {
    returnMessage = "Ошибка в переданных параметрах в функцию check.js - GetMessage(): " + typeof(a);
    return returnMessage;
  }
  //--<check the existence of input parameters

  switch (typeof(a)) {
    //--> boolean
    case "boolean":
      returnMessage = "Переданное GIF-изображение не анимировано";

      if (a){
          returnMessage = "Переданное GIF-изображение анимировано и содержит [" + b + "] кадров";
        };

      break;

    //--< boolean

    //--> number
    case "number":
      returnMessage = "Переданное SVG-изображение содержит [" + a + "] объектов и [" + (b * 4) + "] атрибутов";
      break;

    //--< number

    //--> array
    case "object":

      var squareSum = 0;

      //--> second condition is array
      if (typeof(b) == "object") {

        var lengthA = a.length;
        var lengthB = b.length;
        var maxLength = lengthA - 1;
        if (lengthB > maxLength) {maxLength = lengthB - 1};

        if (maxLength < 1) {
          returnMessage = "Передано пустое изображение!";
          break;

        };

        var product = 0;
        var first = 0;
        var second = 0;

        for (i = 0; i < maxLength; i++) {
          first = i>lengthA ? 0 : a[i];
          second = i>lengthB ? 0 : b[i];
          product = first * second;
          squareSum = squareSum + product;

        };

        returnMessage = "Общая площадь артефактов сжатия: [" + squareSum + "] пикселей";

      }
      //--< the second condition is array

      //--> the second condition is Not an Array
      else {
        for (i = 0; i<a.length; i++) {
          squareSum += squareSum + a[i];
        };

        returnMessage = "Количество красных точек во всех строчках изображения: [" + squareSum + "]";

      };
      //--< the second condition is Not an Array

      break;
    //--< array
  }

  return returnMessage;

}
//--< function to check smth from incoming parameters
