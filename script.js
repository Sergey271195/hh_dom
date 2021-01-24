
class Statistics {

    constructor() {
        this.scoreCounterContainer = document.getElementById("score-counter");
        this.interval = null;
        this.clear();
    }

    incrementScore = function() {
        this.score++;
        this.updateScore();
        return this.score;
    }

    decrementScore = function() {
        this.score--;
        this.updateScore()
        return this.score;
    }   


    updateScore = function() {
        this.scoreCounterContainer.innerHTML = "Total score: " + this.score;
    }

    clear = function() {
        this.score = 0;
        this.updateScore();
    }

}

class ApplicationHandler {
    
    constructor() {
        this.startButton = document.getElementById("create-btn");
        this.factoryContainer = document.getElementById("factory");
        this.orderedContainerWrapper = document.getElementById("order-wrapper");
        this.orderedContainer = document.getElementById("order");
        this.dumpContainer = document.getElementById("dump");

        this.currentBox = null;
        this.statistics = new Statistics(); 

        this.checkBoxPosition = this.checkBoxPosition.bind(this);
        this.startButton.addEventListener("pointerdown", (event) => this.startApplication(event));
        
    }


    startApplication = function(event) {
        this.createNewDraggableBox(event);
        this.addDocumentEventListeners();
    }

    restartApplication = function() {
        this.statistics.clear();
        this.orderedContainer.innerHTML = "";
        this.dumpContainer.innerHTML = "";
        this.currentBox.removeNode();
        this.removeDocumentEventListeners();
    }

    startNewRound = function() {
        this.removeDocumentEventListeners();
    }

    createNewDraggableBox = function(event) {
        this.currentBox = new Box();
        this.currentBox.moveNodeToConatiner(this.factoryContainer);
        this.currentBox.moveNodeOnPage(event);
    }

    
    removeDocumentEventListeners = function() {
        document.removeEventListener("pointerup", this.checkBoxPosition);
        document.removeEventListener("pointermove", this.moveBoxReference);
    }
    
    addDocumentEventListeners = function() {
        this.hasIntersectionWithOrderedContainer();
        document.addEventListener("pointerup", this.checkBoxPosition);
        document.addEventListener("pointermove", 
            this.moveBoxReference = (event) => this.currentBox.moveNodeOnPage(event));
    }

    checkBoxPosition = function() {
        this.hasIntersectionWithOrderedContainer() ? this.appendBoxToOrderedContainer() 
             : (this.hasIntersectionWithDumpContainer() ? this.appendBoxToDumpContainer() 
                 : this.removeBoxAndRestartApplication());
    }

    removeBoxAndRestartApplication = function() {
        this.currentBox.removeNode();
        this.restartApplication();
    }

    hasIntersectionWithOrderedContainer = function() {
        return this.currentBox.haveHorizontalIntersection(this.orderedContainerWrapper);
    }
    
    hasIntersectionWithDumpContainer = function() {
        return this.currentBox.haveHorizontalIntersection(this.dumpContainer);
    }

    appendBoxToOrderedContainer = function() {
        if (this.currentBox.defective) {
            this.restartApplication();
        } else {
            this.statistics.incrementScore();
            this.orderBox();
        }
    }

    orderBox = function() {
        this.currentBox.prerpareToBeOrdered();
        this.currentBox.moveNodeToConatiner(this.orderedContainer);
        this.startNewRound();
    }

    appendBoxToDumpContainer = function() {
        if (!this.currentBox.defective) {
            this.handleDumpedHighQualityBox();
        } else {
            this.statistics.incrementScore();
            this.dumpBox();
        }
    }

    handleDumpedHighQualityBox = function() {
        if (this.statistics.score == 0) {
            this.restartApplication();
        } else {
            this.statistics.decrementScore();
            this.dumpBox();
        }
    }

    dumpBox = function() {
        this.currentBox.prerpareToBeDumped();
        this.currentBox.moveNodeToConatiner(this.dumpContainer);
        this.startNewRound();
    }

}

class Box {

    static INTERSECTION_THRESHOLD = 60;

    constructor() {
        this.defective = Math.random() > 0.5;
        this.node = this.createBoxNode();
    }

    createBoxNode = function() {
        let node = document.createElement("div");
        node.className = "drag-box";
        node.style.backgroundImage = this.defective ? "url('./images/barel.jpg')" : "url('./images/duff.png')";
        node.style.backgroundSize = "cover";
        return node;
    }

    moveNodeOnPage = function(event) {

        let newLeftPosition = event.pageX - this.node.offsetWidth / 2;
        let newTopPosition = event.pageY - this.node.offsetHeight / 2;

        this.node.style.left = newLeftPosition < 0 ? 0 :
            (newLeftPosition + this.node.offsetWidth > window.innerWidth
                ? window.innerWidth - this.node.offsetWidth + "px" : newLeftPosition + "px");

        this.node.style.top = newTopPosition < 0 ? 0 : 
            (newTopPosition + this.node.offsetHeight > window.innerHeight 
                ? window.innerHeight - this.node.offsetHeight + "px" : newTopPosition + "px");
        
        return this.node;
    }

    haveHorizontalIntersection = function(container) {
        let containerBoundingRect = container.getBoundingClientRect();
        let nodeBoundingRect = this.node.getBoundingClientRect();

        let containerLeftBoundry = containerBoundingRect.left;
        let containerRightBoundry = containerBoundingRect.right;
        let nodeLeftBoundry = nodeBoundingRect.left;
        let nodeRightBoundry = nodeBoundingRect.right;

        let leftIntersection = containerLeftBoundry - nodeRightBoundry < - Box.INTERSECTION_THRESHOLD;
        let rightIntersection = containerRightBoundry - nodeLeftBoundry > Box.INTERSECTION_THRESHOLD;

        return (leftIntersection && rightIntersection)
    }

    prerpareToBeDumped = function() {
        this.node.innerHTML = "";
    }

    prerpareToBeOrdered = function() {
        this.node.style.position = "inherit";
    }

    removeNode = function() {
        this.node.remove();
    }

    moveNodeToConatiner = function(container) {
        container.appendChild(this.node);
    }

}


let application = new ApplicationHandler();
