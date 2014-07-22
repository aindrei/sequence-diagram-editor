(function(){


String.prototype.width = function(font) {
  var f = font || '12px arial',
      o = $('<div>' + this + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w;
};

var SequenceDiagram = function() {
	//this.objects = ["aa", "bb", "cc"];
	//this.messages = [{name: "msgatob", from: "aa", to: "bb"}, {name: "msgbtoc", from: "bb", to: "cc"}];
	var objects = [];
	var messages = [];

	var addObject = function(objName) {
		if (objects.indexOf(objName) > -1) {
			return;
		}
		objects.push(objName);
	};

	this.addMessage = function(fromObject, toObject) {
		addObject(fromObject);
		addObject(toObject);
		var newMessage = {name: "msgatob", from: fromObject, to: toObject};
		messages.push(newMessage);
	};
	
	this.getObjects = function() {
		return objects;
	};
	
	this.getMessages = function() {
		return messages;
	};
};

var SequenceDiagramImageBuilder = function(imgElem) {
	var LINE_TOP_MARGIN = 30;
	var w = imgElem.attr("width");
	var h = imgElem.attr("height");
	var canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	var canvasContext = canvas.getContext("2d");
	var drawnObjects = {};

	var drawObject = function(objectName, leftOffset) {
		var textFont = "20px Arial";
		var textW = objectName.width(textFont);

		canvasContext.fillStyle = "blue";
		canvasContext.font = textFont;
		canvasContext.fillText(objectName, leftOffset - (textW / 2), 20);

	    canvasContext.moveTo(leftOffset, LINE_TOP_MARGIN);
        canvasContext.lineTo(leftOffset, h);
        canvasContext.stroke();
        
        drawnObjects[objectName] = {leftOffset: leftOffset, type: "object"};
	};
	
	var drawMessageArrow = function(x, y, isLeftToRight) {
		var arrowWidth = 10;
		var directionFactor = isLeftToRight ? -1 : 1;

	    canvasContext.moveTo(x + directionFactor * arrowWidth , y - arrowWidth);
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
		
	    canvasContext.moveTo(x + directionFactor * arrowWidth , y + arrowWidth);
        canvasContext.lineTo(x, y);
        canvasContext.stroke();
	};
	
	var drawMessage = function(messageName, fromObjectName, toObjectName, topOffset){
		var fromX = drawnObjects[fromObjectName].leftOffset;
		var toX = drawnObjects[toObjectName].leftOffset;

	    canvasContext.moveTo(fromX, topOffset);
        canvasContext.lineTo(toX, topOffset);
        canvasContext.stroke();
        
        //Draw arrow
        drawMessageArrow(toX, topOffset, toX > fromX);
	};
	
	var cleanCanvas = function() {
		canvasContext.fillStyle = "white";
		canvasContext.fillRect(0, 0, w, h);
	};
	
	this.paintDiagram = function(sequenceDiagram) {
		cleanCanvas();
		
		// Draw vertical lines for objects
		var objects = sequenceDiagram.getObjects();
		var numObjects = objects.length;
		var verticalSpacing = w / numObjects;
		for (var i = 0; i < numObjects; i++) {
			drawObject(objects[i], i * verticalSpacing + verticalSpacing / 2);
		}
		
		// Draw horizontal lines for messages
		var messages = sequenceDiagram.getMessages();
		var numMessages = messages.length;
		var horizontalSpacing = h / numMessages;
		for (var i = 0; i < numMessages; i++) {
			var message = messages[i];
			drawMessage(message.name, message.from, message.to, i * horizontalSpacing + horizontalSpacing / 2);
		}
		
		imgElem.attr("src", canvas.toDataURL("image/png"));
	};
};

var SequenceDiagramParser = function(code) {
	this.code = code;

	this.parse = function() {
		var sequenceDiagram = new SequenceDiagram();
		var lines = code.split("\n");
		if (!lines) {
			alert("Empty diagram");
		}
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (!line) {
				continue;
			}
			var objs = line.split(":");
			if (objs.length !== 2) {
				continue;
			}
			var fromObject = objs[0];
			var toObject = objs[1];
			sequenceDiagram.addMessage(fromObject, toObject);
		}
		return sequenceDiagram;
	};
};

$(function(){
	$("#create-img").click(function(){
		var code = $("#seq-diag-code").val();
		var parser = new SequenceDiagramParser(code);
		var sequenceDiagram = parser.parse();
		
		var imgElem = $("#seq-diag-img");
		var imgBuilder = new SequenceDiagramImageBuilder(imgElem);
		imgBuilder.paintDiagram(sequenceDiagram);
	});
});


})();
