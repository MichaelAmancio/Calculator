/**
 * Manipulando o DOM
 * a maioria das vezes manipulamos as informações do DOM
 * mas precisamos controlar as ações
 * 
 * se quiser trabalhar na janela, utilizar window
 * se for trabalhar no documento, utilizar document
 * 
 * calculator.displayDate = new Date().toLocaleDateString('pt-br') para data
 * 
 * calculator.displayTime = new Date().toLocaleTimeString('pt-br') para hora
 * 
 */

class CalcController{

    //parâmetros
    constructor(){

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        //para guardar a operação
        this._operation = [ ];
        // quando houver _ significa que é privado
        this._locale ='pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        //this._calculator = "0";
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    //colar na calculadora
    pasteFromClipboard(){

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);

            console.log(text);
        });
    }

    //copiar da calculadora
    copyToClipboard(){

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    //método principal
    initialize(){

        this.setDisplayDateTime();
        //função executada em intervalos de tempo
       setInterval(()=>{

        this.setDisplayDateTime();

        }, 1000);

       //setTimeout(()=>{
            //limpa o intervalo que está rodando
          //  clearInterval(interval);
        //}, 10000);

        this.setLastNumberToDisplay();
        this. pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();
                
            });
        });

    } 

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){

        if(this._audioOnOff){
            
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyboard(){

        document.addEventListener('keyup', e=>{

            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backspace':
                    this.clearEntry();
                    break;
    
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':            
                    this.addOperation(e.key);
                    break;   
                    
                case 'Enter':
                case '=':    
                    this.calc();
                    break;
    
                case '.':
                case ',':    
                    this.addDot();
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;   

                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }
  
    //criação de evento próprio e multiplicação de eventos - fn é a função
    //split - converter uma string em um array
    addEventListenerAll(element, events, fn){

        //para cada evento ele executa esta função
        events.split(' ').forEach(event =>{

            element.addEventListener(event, fn, false);
        });

    }
    
    clearAll(){

        this._operation = [0];
        this._lastNumber =[0];
        this._lastOperator =[0];

        this.setLastNumberToDisplay();
    }

    clearEntry(){

        this._operation.pop();

        this.setLastNumberToDisplay();
    }

    setError(){

        this.displayCalc = "ERROR!!!";
    }

    addDot(){

         let lastOperation= this.getLastOperation();

         if(typeof lastOperation ==='string' && lastOperation.split('').indexOf('.') > -1) return;

         if(this.isOperator(lastOperation) || !lastOperation){
             this.pushOperation('0.');
         }else{
             this.setLastOperation(lastOperation.toString() + '.');
         }

         this.setLastNumberToDisplay();

    }

    //função para tratar array
    getLastOperation(){

        return this._operation[this._operation.length-1];
    }

    setLastOperation(value){
         
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value){

        //busca o valor neste array
        return (['+','-','*', '/','%'].indexOf(value) > -1);
    }

    pushOperation(value){

        this._operation.push(value);

        if(this._operation.length > 3){

            this.calc();
        }
    }

    getResult(){

        try{
            return eval(this._operation.join(""));
        }
        catch(e){
            setTimeout(()=>{
                this.setError();
            }, 1);
            
        }
        
    }

    calc(){

        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){
           
            let firstItem= this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if( this._operation.length == 3){

            
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if(last == '%'){

            result /= 100;
        
            this._operation =[result];

        }else{

            this._operation =[result];

            if(last) this._operation.push(last);

        }

        this.setLastNumberToDisplay();
        

    }

    getLastItem(isOperator = true){

        let lastItem;

        for(let i = this._operation.length - 1; i >= 0; i--){

            if(this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }

            
        }

        if(!lastItem){
            lastItem =(isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;

    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }

    addOperation(value){

        //se não for um número
        if(isNaN(this.getLastOperation())){
            //quando for uma string
            if(this.isOperator(value)){
                //trocar o operador
                //vai ser igual ao operador do momento
                this.setLastOperation(value);

            }else{

                this.pushOperation(value);

                this.setLastNumberToDisplay();

            }


        }else{

            if(this.isOperator(value)){

                this.pushOperation(value);
            }else{
                //quando for um número
                //Pega o n°, converte para uma string e concatena com outra string
                // aí sim insere em um array
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            }
            
        }

        //push - vai ao final do array e adiciona mais uma informação
        //this._operation.push(value);

        console.log(this._operation);
    }

    execBtn(value){

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break; 

            case 'subtracao':
                this.addOperation('-');
                break;     
                
            case 'divisao':
                this.addOperation('/');
                break;   
                
            case 'multiplicacao':
                this.addOperation('*');
                break;    

            case 'porcento':
                this.addOperation('%');
                break;   
                
            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
                
            default:
                this.setError();
                break;    
        }
    }


    initButtonsEvents(){

        //selecionar por uma consulta, todas as tags das classes especificadas
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        // a partir de dois argumentos, inserir parenteses (btn,index)
        buttons.forEach((btn,index)=>{

            //EventListener = escutar um evento de mouse, teclado
            this.addEventListenerAll(btn,"click drag", e=>{

                //console.log(btn.className.baseVal.replace("btn-",""));
                let textBtn = btn.className.baseVal.replace("btn-","");

                this.execBtn(textBtn);
            });


            this.addEventListenerAll(btn,"mouseover mouseup mousedown", e=>{

                btn.style.cursor ="pointer";
            });

        });
    }

    setDisplayDateTime(){

        this.displayDate =this.currentDate.toLocaleDateString(this._locale,
        {day: "2-digit",
        month: "long", //ou short
        year: "numeric"
        });
        this.displayTime =this.currentDate.toLocaleTimeString(this._locale);
        
    }

    
    //atribuição e recuperação de valores
    get displayCalc(){
        return _displayCalcEl.innerHTML;
    }
    set displayCalc(value){

        if(value.toString().length > 10){
            this.setError();
            return false;
        }
       return this._displayCalcEl.innerHTML = value;
    }
    get displayTime(){

        return this._timeEl.innerHTML;

    }
    set displayTime(time){
       return this._timeEl.innerHTML = time;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }
    set displayDate(data){ 
        return this._dateEl.innerHTML = data;
    }
    get currentDate(){
        return new Date();

    }
    set currentDate(data){

        return this._currentDate = data;
    }

   
}