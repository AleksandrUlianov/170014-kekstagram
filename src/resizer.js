'use strict';

(function() {
  /**
   * @constructor
   * @param {string} image
   */
  var Resizer = function(image) {
    // Изображение, с которым будет вестись работа.
    this._image = new Image();
    this._image.src = image;

    // Холст.
    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');

    // Создаем холст только после загрузки изображения.
    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения. Это нужно
      // для удобства работы с координатами.
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;

      /**
       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
       * стороны изображения.
       * @const
       * @type {number}
       */
      var INITIAL_SIDE_RATIO = 0.75;

      // Размер меньшей стороны изображения.
      var side = Math.min(
          this._container.width * INITIAL_SIDE_RATIO,
          this._container.height * INITIAL_SIDE_RATIO);

      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
      // от размера меньшей стороны.
      this._resizeConstraint = new Square(
          this._container.width / 2 - side / 2,
          this._container.height / 2 - side / 2,
          side);

      // Отрисовка изначального состояния канваса.
      this.setConstraint();
    }.bind(this);

    // Фиксирование контекста обработчиков.
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  };



  Resizer.prototype = {
    /**
     * Родительский элемент канваса.
     * @type {Element}
     * @private
     */
    _element: null,

    incDecCoordinate: function(myCoordinate, mySpace, increase) {

      if (!increase) {
        myCoordinate = myCoordinate - mySpace;

      } else {
        myCoordinate = myCoordinate + mySpace;

      }

      return myCoordinate;
    },

    /**
     * Aleksandr Ulianov
     * отрисовка точки (одного элемента границы)
     * @param {float} XCoord
     * @param {float} YCoord
     * @param {float} myRad
     */
    drawCircle: function(XCoord, YCoord, myRad) {

      this._ctx.beginPath();
      this._ctx.arc(XCoord, YCoord, myRad, 0, 2 * Math.PI);
      this._ctx.fill();

    },

    /**
     * Aleksandr Ulianov
     * отрисовка границ области
     * пунктирной линией
     * выненсено в отдельную функцию для
     * универсалицаии процесса отрисовки границы
     *
     */
    drawDashBorder: function() {

      this._ctx.strokeRect(
        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        this._resizeConstraint.side - this._ctx.lineWidth / 2,
        this._resizeConstraint.side - this._ctx.lineWidth / 2);
      var stopX = (this._resizeConstraint.side - this._ctx.lineWidth) / 2;
      var stopY = (this._resizeConstraint.side - this._ctx.lineWidth) / 2;

      return [stopX, stopY];
    },

    /**
     * Aleksandr Ulianov
     * проверка достижения текущей координаты
     * требуемого значения
     * @param {float} newCoordinate
     * @param {float} destCoord
     * @param {boolean} increaseCoord
     *
     */
    checkIncreaseResult: function(newCoordinate, destCoord, increaseCoord) {
      var compRes = false;

      if (increaseCoord === false) {
        compRes = newCoordinate > destCoord;

      } else {
        compRes = newCoordinate < destCoord;

      }

      return compRes;

    },

    /**
     * Aleksandr Ulianov
     * вычисление следующей координаты
     * @param {float} oldCoordinate
     * @param {boolean} increaseCoord
     * @param {float} destCoordinate
     * @param {number} displacement
     *
     */
    getNextCoord: function(oldCoordinate, increaseCoord, destCoordinate, displacement) {
      var newCoordinate = oldCoordinate;

      var compRes = this.checkIncreaseResult(newCoordinate, destCoordinate, increaseCoord);

      if (compRes) {
        newCoordinate = this.incDecCoordinate(newCoordinate, displacement, increaseCoord);
      } else {
        newCoordinate = destCoordinate;
      }

      compRes = this.checkIncreaseResult(newCoordinate, destCoordinate, increaseCoord);

      if (!compRes) {
        newCoordinate = destCoordinate;
      }

      return newCoordinate;
    },

    /**
     * Aleksandr Ulianov
     * функция для отрисовки границы точками
     */
    drawCircleBorder: function() {
      var xStart = ( -this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
      var yStart = xStart;
      var xEnd = this._resizeConstraint.side / 2 - this._ctx.lineWidth;
      var yEnd = xEnd;
      var rad = this._ctx.lineWidth / 2;
      var CircleSpace = 8;

      var curX = xStart;
      var curY = yStart;
      var increaseX = false;
      var increaseY = false;
      var nextCoordX = 0;
      var nextCoordY = 0;
      var coordinates = [];

      //задаем массив точек, через которые проходит граница выделения
      var pointsArray = [[xEnd, yStart],
        [xEnd, yEnd],
        [xStart, yEnd],
        [xStart, yStart]];

      this._ctx.fillStyle = 'yellow';

      //цикл по точкам массива
      for (var i = 0; i < pointsArray.length; i++) {
        coordinates = pointsArray[i];

        //координаты точки, к которой стремимся
        nextCoordX = coordinates[0];
        nextCoordY = coordinates[1];

        increaseX = nextCoordX > curX;
        increaseY = nextCoordY > curY;

        //цикл пока не достигнем координат нашей точки
        while ( (curX !== nextCoordX) || (curY !== nextCoordY)) {

          //рисуем элемент границы
          this.drawCircle(curX, curY, rad);

          //изменяем координаты, если нужно
          curX = this.getNextCoord(curX, increaseX, nextCoordX, (rad + CircleSpace));
          curY = this.getNextCoord(curY, increaseY, nextCoordY, (rad + CircleSpace));

        }

      }

      return [xEnd + rad, yEnd + rad];

    },

  /**
   * Aleksandr Ulianov
   * функция для отрисовки границы области выделения
   */
    drawBorder: function() {

      var returnArray = [0, 0];

      if (Math.random() < 0.5) {

        //draw dash border
        returnArray = this.drawDashBorder();

      } else {
        //draw border with circles
        returnArray = this.drawCircleBorder();

      }

      return returnArray;

    },

    /**
     * Положение курсора в момент перетаскивания. От положения курсора
     * рассчитывается смещение на которое нужно переместить изображение
     * за каждую итерацию перетаскивания.
     * @type {Coordinate}
     * @private
     */
    _cursorPosition: null,

    /**
     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
     * от верхнего левого угла исходного изображения.
     * @type {Square}
     * @private
     */
    _resizeConstraint: null,

    /**
     * Отрисовка канваса.
     */
    redraw: function() {
      // Очистка изображения.
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

      // Параметры линии.
      // NB! Такие параметры сохраняются на время всего процесса отрисовки
      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
      // чего-либо с другой обводкой.

      // Толщина линии.
      this._ctx.lineWidth = 6;
      // Цвет обводки.
      this._ctx.strokeStyle = '#ffe753';
      // Размер штрихов. Первый элемент массива задает длину штриха, второй
      // расстояние между соседними штрихами.
      this._ctx.setLineDash([15, 10]);
      // Смещение первого штриха от начала линии.
      this._ctx.lineDashOffset = 7;

      // Сохранение состояния канваса.
      // Подробней см. строку 132.
      this._ctx.save();

      // Установка начальной точки системы координат в центр холста.
      this._ctx.translate(this._container.width / 2, this._container.height / 2);

      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
      // Отрисовка изображения на холсте. Параметры задают изображение, которое
      // нужно отрисовать и координаты его верхнего левого угла.
      // Координаты задаются от центра холста.
      this._ctx.drawImage(this._image, displX, displY);

      // Отрисовка прямоугольника, обозначающего область изображения после
      // кадрирования. Координаты задаются от центра.

      //--> Aleksandr Ulianov. all draw systems moved to the function DrawBorder
      var stopArray = this.drawBorder();

      var stopX = stopArray[0];
      var stopY = stopArray[1];

      this._ctx.beginPath();
      //--< Aleksandr Ulianov. all draw systems moved to the function DrawBorder

      //outer rectangle
      this._ctx.moveTo(-this._container.width / 2, -this._container.height / 2);
      this._ctx.lineTo(this._container.width / 2, -this._container.height / 2);
      this._ctx.lineTo(this._container.width / 2, this._container.height);
      this._ctx.lineTo(-this._container.width / 2, this._container.height);
      this._ctx.lineTo(-this._container.width / 2, -this._container.height / 2);

      //--> Aleksandr Ulianov dark background added
      //inner rectangle
      this._ctx.lineTo(( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)), ( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)));
      this._ctx.lineTo(stopX, ( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)));
      this._ctx.lineTo(stopX, stopY);
      this._ctx.lineTo(( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)), stopY);
      this._ctx.lineTo(( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)), ( -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth)));

      //fill style
      this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
      this._ctx.fill('evenodd');

      //text adding
      this._ctx.font = '15px Tahoma';
      this._ctx.fillStyle = 'yellow';
      this._ctx.fillText('' + this._image.naturalHeight + ' x ' + this._image.naturalWidth, -30, -(this._resizeConstraint.side / 2) - (this._ctx.lineWidth) - 10);

      //--< Aleksandr Ulianov dark background added

      // Восстановление состояния канваса, которое было до вызова ctx.save
      // и последующего изменения системы координат. Нужно для того, чтобы
      // следующий кадр рисовался с привычной системой координат, где точка
      // 0 0 находится в левом верхнем углу холста, в противном случае
      // некорректно сработает даже очистка холста или нужно будет использовать
      // сложные рассчеты для координат прямоугольника, который нужно очистить.
      this._ctx.restore();
    },

    /**
     * Включение режима перемещения. Запоминается текущее положение курсора,
     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
     * позволяющие перерисовывать изображение по мере перетаскивания.
     * @param {number} x
     * @param {number} y
     * @private
     */
    _enterDragMode: function(x, y) {
      this._cursorPosition = new Coordinate(x, y);
      document.body.addEventListener('mousemove', this._onDrag);
      document.body.addEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Выключение режима перемещения.
     * @private
     */
    _exitDragMode: function() {
      this._cursorPosition = null;
      document.body.removeEventListener('mousemove', this._onDrag);
      document.body.removeEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Перемещение изображения относительно кадра.
     * @param {number} x
     * @param {number} y
     * @private
     */
    updatePosition: function(x, y) {
      this.moveConstraint(
          this._cursorPosition.x - x,
          this._cursorPosition.y - y);
      this._cursorPosition = new Coordinate(x, y);
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onDragStart: function(evt) {
      this._enterDragMode(evt.clientX, evt.clientY);
    },

    /**
     * Обработчик окончания перетаскивания.
     * @private
     */
    _onDragEnd: function() {
      this._exitDragMode();
    },

    /**
     * Обработчик события перетаскивания.
     * @param {MouseEvent} evt
     * @private
     */
    _onDrag: function(evt) {
      this.updatePosition(evt.clientX, evt.clientY);
    },

    /**
     * Добавление элемента в DOM.
     * @param {Element} element
     */
    setElement: function(element) {
      if (this._element === element) {
        return;
      }

      this._element = element;
      this._element.insertBefore(this._container, this._element.firstChild);
      // Обработчики начала и конца перетаскивания.
      this._container.addEventListener('mousedown', this._onDragStart);
    },

    /**
     * Возвращает кадрирование элемента.
     * @return {Square}
     */
    getConstraint: function() {
      return this._resizeConstraint;
    },

    /**
     * Смещает кадрирование на значение указанное в параметрах.
     * @param {number} deltaX
     * @param {number} deltaY
     * @param {number} deltaSide
     */
    moveConstraint: function(deltaX, deltaY, deltaSide) {
      this.setConstraint(
          this._resizeConstraint.x + (deltaX || 0),
          this._resizeConstraint.y + (deltaY || 0),
          this._resizeConstraint.side + (deltaSide || 0));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     */
    setConstraint: function(x, y, side) {
      if (typeof x !== 'undefined') {
        this._resizeConstraint.x = x;
      }

      if (typeof y !== 'undefined') {
        this._resizeConstraint.y = y;
      }

      if (typeof side !== 'undefined') {
        this._resizeConstraint.side = side;
      }

      requestAnimationFrame(function() {
        this.redraw();
        window.dispatchEvent(new CustomEvent('resizerchange'));
      }.bind(this));
    },

    /**
     * Удаление. Убирает контейнер из родительского элемента, убирает
     * все обработчики событий и убирает ссылки.
     */
    remove: function() {
      this._element.removeChild(this._container);

      this._container.removeEventListener('mousedown', this._onDragStart);
      this._container = null;
    },

    /**
     * Экспорт обрезанного изображения как HTMLImageElement и исходником
     * картинки в src в формате dataURL.
     * @return {Image}
     */
    exportImage: function() {
      // Создаем Image, с размерами, указанными при кадрировании.
      var imageToExport = new Image();

      // Создается новый canvas, по размерам совпадающий с кадрированным
      // изображением, в него добавляется изображение взятое из канваса
      // с измененными координатами и сохраняется в dataURL, с помощью метода
      // toDataURL. Полученный исходный код, записывается в src у ранее
      // созданного изображения.
      var temporaryCanvas = document.createElement('canvas');
      var temporaryCtx = temporaryCanvas.getContext('2d');
      temporaryCanvas.width = this._resizeConstraint.side;
      temporaryCanvas.height = this._resizeConstraint.side;
      temporaryCtx.drawImage(this._image,
          -this._resizeConstraint.x,
          -this._resizeConstraint.y);
      imageToExport.src = temporaryCanvas.toDataURL('image/png');

      return imageToExport;
    }
  };

  /**
   * Вспомогательный тип, описывающий квадрат.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @param {number} side
   * @private
   */
  var Square = function(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  };

  /**
   * Вспомогательный тип, описывающий координату.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @private
   */
  var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
  };

  window.Resizer = Resizer;
})();
