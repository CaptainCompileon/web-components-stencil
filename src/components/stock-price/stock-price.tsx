import { Component, Element, h, Prop, State, Watch, Listen } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'stock-price',
  styleUrl: './stock-price.scss',
  shadow: true
})
export class StockPrice {
  initialStockSymbol: string;
  stockInput: HTMLInputElement;
  // This is a reference to the element that is hosting the component
  @Element() el: HTMLElement;
  // This is a reference to the state of the component
  @State() fetchedPrice: number;
  @State() stockUserInput: string;
  @State() stockInputValid = false;
  @State() error: string;
  @State() loading = false;

  @Prop({mutable: true, reflect: true}) stockSymbol: string;

  @Watch('stockSymbol')
  stockSymbolChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.fetchStockPrice(newValue);
      this.stockUserInput = newValue;
    }
  }
  onUserInput(event: Event) {
    this.stockUserInput = (event.target as HTMLInputElement).value;
    if (this.stockUserInput.trim() !== '') {
      this.stockInputValid = true;
    } else {
      this.stockInputValid = false;
    }
  }
  async onFetchStockPrice(event: Event) {
    event.preventDefault();
    this.stockSymbol = this.stockInput.value;
  }

  componentWillLoad() {
    console.log('componentWillLoad');
    console.log(this.stockSymbol);
  }

  componentDidLoad() {
    console.log('componentDidLoad');
    if (this.stockSymbol) {
      // this.initialStockSymbol = this.stockSymbol;
      this.fetchStockPrice(this.stockSymbol);
      this.stockUserInput = this.stockSymbol;
      this.stockInputValid = true;
    }
  }

  componentWillUpdate() {
    console.log('componentWillUpdate');

  }

  componentDidUpdate() {
    console.log('componentDidUpdate');
    // if (this.stockSymbol !== this.initialStockSymbol) {
    //   this.initialStockSymbol = this.stockSymbol;
    //   this.fetchStockPrice(this.stockSymbol);
    // }
  }

  conponentDidUnload() {
    console.log('conponentDidUnload');
  }

  //body means that it listens from the body (or other component)
  @Listen('symbolSelected', { target: 'body' })
  onStockSymbolSelected(event: CustomEvent) {
    console.log('stockSymbolSelected', event.detail);
    if (event.detail && event.detail !== this.stockSymbol) {
      this.stockSymbol = event.detail;
    }
  }
  fetchStockPrice(stockSymbol: string) {
    this.loading = true;
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`).then( res => {
      return res.json();
    }).then( parsedRes => {
      console.log(parsedRes['Global Quote']['05. price']);
      if (!parsedRes['Global Quote']['05. price'])  {
        throw new Error('Invalid symbol!');
      }
      this.error = null;
      this.fetchedPrice = +parsedRes['Global Quote']['05. price'];
      this.loading = false;
    }).catch( err => {
      this.error = err.message;
      this.fetchedPrice = null;
      this.loading = false;
    });
  }

  hostData() {
    return {class: this.error ? 'error' : ''};
  }

  render() {
    let dataContent = <p>Please enter a symbol!</p>;

    if (this.fetchedPrice) {
      dataContent = <p>Price: {this.fetchedPrice}$</p>;
    }
    if (this.error) {
      dataContent = <p>{this.error}</p>;

    }
    if (this.loading) {
      dataContent = <uc-spinner></uc-spinner>;
    }
    return [
      <form onSubmit={this.onFetchStockPrice.bind(this)}>
        <input
          id="stock-symbol"
          ref={el => this.stockInput = el}
          value={this.stockUserInput}
          onInput={this.onUserInput.bind(this)}
        />
        <button type="submit" disabled={!this.stockInputValid || this.loading}>Fetch</button>
      </form>,
      <div>
        {dataContent}
      </div>
    ];
  }
}
//@Listen('symbolSelected', { target: 'body' })
