//Creating Modules
/*
1. Budget Controller
2. UI controller
3. controller -> Which Make both Modules interact With Each Other 
*/
var budgetController = (function(){
   
    var Expense = function(id , desc , val){ //return object of Expense ,
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    }

    Expense.prototype.percalculate = function(Income){
        if(Income > 0){
            this.percentage = Math.round((this.val/Income)*100);
        }   
        else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getpercentage = function(){
        return this.percentage;
    }

    var Income = function(id , desc , val){ // return object of income
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var calculateTotal = function(Type){
        var sum = 0;

        data.item[Type].forEach(function(curr){
            sum += curr.val;
        });

        data.total[Type] = sum;
    }

    var data = {    // data structure to collect all data of the items
        item : {    
            exp : [],  // to collect expense of every items currently in expense
            inc : []  // to collect income of every item currently in income
        },

        total : {
            exp : 0,
            inc : 0
        },

        budget : 0,

        percentage : 0

    };

    return{

         additem : function(Type , Desc , Value){
            var newitem,ID;

            if(data.item[Type].length === 0)
                ID = 0;
            else
                ID = data.item[Type][data.item[Type].length - 1].id + 1; // Providing unique ID to a new item by increamenting 1 to last ID

            if(Type === 'exp'){ 
                newitem = new Expense(ID , Desc , Value);   //calling expense function if type is exp
            }
            else{
                newitem = new Income(ID , Desc , Value);    //else income function
            }
            data.item[Type].push(newitem);  //pushing the current item in array of its Type, meas if Type is exp
                                            //push it in exp array else inc array 

            return newitem;
        },

        calculateBudget : function(){
            var sum = 0;
            
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;
            data.percentage = Math.round((data.total.exp/data.total.inc)*100);
            // data.percentage *= 100;
        },

        calcPercent : function(){

            data.item.exp.forEach(function(curr){
                curr.percalculate(data.total.inc);
            });

        },

        getPercent : function(){
            var Percent = data.item.exp.map(function(curr){
                return curr.getpercentage();
            });

            return Percent;
        },

        getBudget : function(){
            return {
                Budget : data.budget,
                Income : data.total.inc,
                Expense : data.total.exp,
                percentage : data.percentage
            }
        },

        deleteItem : function(Type , id){
            var ID , index;

            ID = data.item[Type].map(function(curr){    //Map returns a new array of particular type
                return curr.id; //Here it is returning an array of id's  so that we can know the indewx of the id of the element we want to delete
            });

            index = ID.indexOf(id); //indexOf gives you index of an element.

            if(index != -1)
                data.item[Type].splice(index,1); // Splice is used to delete the element with (index  , how many elements you want to delete)

        },


        Test : function(){
            console.log(data);
        }
    };


})();

var UIcontroller = (function(){
                                // Made a DOMstr Method to use it for class names we need to use constantly.
    var DOMstr = {
        inptype : ".add__type", // Inc for + and Exp for -
        inpdes : ".add__description",
        inpval : ".add__value",
        inpbtn : ".add__btn",
        expenseContainer : ".expenses__list",
        incomeContainer : ".income__list",
        budgetVal : ".budget__value",
        incomeVal : ".budget__income--value",
        expenseVal : ".budget__expenses--value",
        exppercentage : ".budget__expenses--percentage",
        container : ".container",
        percent : ".item__percentage",
        date : ".budget__title--month",
    };
            //Take Input From UI give it to Controller


    var FormatNumber = function(num , Type){
        var int , dec ;

        num = Math.abs(num);
        num = num.toFixed(2);

        num = num.split('.');
        int = num[0];
        dec = num[1];

        if(int.length > 3){
            int = int.substr(0 , int.length - 3) + ',' + int.substr(int.length - 3 , 3);
        }

        return (Type == 'exp' ? '-' : '+') + ' ' +  int + '.' + dec ;
    };

      var List = function(Nodes , callback){
                for(var i = 0; i<Nodes.length ; i++)
                    callback(Nodes[i] , i);

        };

    return {

        getInput : function(){
            return {
                type: document.querySelector(DOMstr.inptype).value,
                des : document.querySelector(DOMstr.inpdes).value,
                val : parseFloat(document.querySelector(DOMstr.inpval).value)
            };
        },

        getDOM: function(){
            return DOMstr;
        },

        addItemListener : function(item , Type){
            var html , newhtml , element;

            //1. make html string
            if(Type === 'exp'){
                element = DOMstr.expenseContainer;
                html = '<div class="item clearfix" id="exp-%ID%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%Perc%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                element = DOMstr.incomeContainer;
                html =  '<div class="item clearfix" id="inc-%ID%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //2.replace ID , value, description in string
            newhtml = html.replace('%ID%',item.id);
            newhtml = newhtml.replace('%desc%' , item.desc);
            newhtml = newhtml.replace('%value%',FormatNumber(item.val , Type));

            // if(Type == 'exp')
            //     newhtml = newhtml.replace('%Perc%',item.percentage);

            //3. Display in UI
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        } ,

        clearFields : function(){
            var fieldArray , field;

            field = document.querySelectorAll(DOMstr.inpdes + ', ' + DOMstr.inpval); // gives the value in form of list
            fieldArray = Array.prototype.slice.call(field); //convert list to arrays, slice is used to make a copy of array
                // using call on array prototype we change this in Array protoype to list to get copy of list as an array using slice
            fieldArray.forEach(function(val , ind , array){
                val.value = "";     // putting empty string in value of array elements which are description and value
            });
            fieldArray[0].focus(); // focus is used so type bar returns back to this element which is 0th indexed in this case 
        },

        DisplayBudget : function(Budget){

            var Type ;

            Budget >= 0 ? Type = 'inc' : Type = 'exp';

            document.querySelector(DOMstr.budgetVal).innerHTML = FormatNumber(Budget.Budget , Type);
            document.querySelector(DOMstr.incomeVal).innerHTML = FormatNumber(Budget.Income , 'inc');
            document.querySelector(DOMstr.expenseVal).innerHTML = FormatNumber(Budget.Expense , 'exp');

            if(Budget.Budget > 0)      
                document.querySelector(DOMstr.exppercentage).innerHTML = Budget.percentage + '%';
            else
                document.querySelector(DOMstr.exppercentage).innerHTML = '--';

        },

        UIdeleteItem : function(ItemID){
            var element = document.getElementById(ItemID);
            element.parentNode.removeChild(element);
        },

        DisplayPercentage : function(percentage){

            var Nodes = document.querySelectorAll(DOMstr.percent);
          

            List(Nodes , function(curr , index){

                if(percentage[index] > 0)
                    curr.textContent = percentage[index] + '%';
                else
                    curr.textContent = '--';

            });

        },

        ChangeUI : function(){

            var field = document.querySelectorAll(DOMstr.inpdes + ', ' +  DOMstr.inpval + ',' + DOMstr.inptype);

            List(field , function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstr.inpbtn).classList.toggle('red');

        },

        Date : function(){
            var date , year, month;
            date = new Date();
            month = date.getMonth();
            year = date.getFullYear();
            var months = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];
            document.querySelector(DOMstr.date).textContent = months[month] + ' ' + year;
        },

    };

     

})();

var controller = (function(budcntrl , UIcntrl){ //Manages Both Our Budget and UI controllers .
    var setUpEventListener = function(){    // All our Event Listeners 
        var DOM = UIcntrl.getDOM();

        document.querySelector(DOM.budgetVal).innerHTML = 0;
        document.querySelector(DOM.incomeVal).innerHTML = 0;
        document.querySelector(DOM.expenseVal).innerHTML = 0;      
        document.querySelector(DOM.exppercentage).innerHTML = '--';

        document.querySelector(DOM.inpbtn).addEventListener('click',itemcntrl);
        document.addEventListener('keypress',function(event){
            if(event.code === 13 || event.which === 13)
                itemcntrl();
         });

        document.querySelector(DOM.container).addEventListener('click', itemdelete);

        document.querySelector(DOM.inptype).addEventListener('change' , UIcntrl.ChangeUI);
    }
    
    var updateBudget = function(){
        // 1 . Calculate Budget
        budcntrl.calculateBudget();

        //2. Get Budget from budgtet cntroller
        var totalBudget = budcntrl.getBudget();

        //3. Display Budget
        UIcntrl.DisplayBudget(totalBudget);

    }

    var percentCntrl = function(){
        //1. calculate percentage

        budcntrl.calcPercent();

        //2. update percentage 
        var percentage = budcntrl.getPercent();

        //3. Display Percentage 
        UIcntrl.DisplayPercentage(percentage);

    }

    var itemcntrl = function(){
        var input,newitem;
        //1. Get input Values.
        input = UIcntrl.getInput();
        
        if(input.val > 0 && !isNaN(input.val) && input.desc !== ""){
            //2. Add items to Budget Contoller
            newitem = budcntrl.additem(input.type , input.des , input.val);
            //3. Add items to UI controller
            UIcntrl.addItemListener(newitem , input.type);
            //4. Clear Input fiels
            UIcntrl.clearFields();
            //5. Calculate budget and update Budget
            updateBudget();
            //6. Update Percentage
            percentCntrl();
        }
        else{
            UIcntrl.clearFields();
        }
        
    }

    var itemdelete = function(event){
        var item,ItemID

        item = event.target;
        for(var i = 0 ; i<4 ; i++)
            item = item.parentNode;

        item = item.id;

        ItemID = item;
        if(item){
            item = item.split('-');
            ID = parseInt(item[1]);
            Type = item[0];
            console.log(ID);
        }

        //1. Delete Item From Budget Data
        budcntrl.deleteItem(Type , ID);

        //2 . Delete Item from UI
        UIcntrl.UIdeleteItem(ItemID);

        //3. Update Budget
        updateBudget();

        // 4. Update Percentage
        percentCntrl();

    }

    return {
        init : function(){  //Init Function to Start our Program
            console.log("Its begin");
            UIcntrl.Date();
            setUpEventListener();
        } 
    }

})(budgetController , UIcontroller);

controller.init(); 