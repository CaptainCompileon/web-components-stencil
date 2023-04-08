import { Component, EventEmitter, Event, h, State } from '@stencil/core';
import { AV_API_KEY } from '../../global/global';

@Component({
  tag: 'stock-finder',
  styleUrl: './stock-finder.scss',
  shadow: true
})
export class StockFinder {
  stockNameInput: HTMLInputElement;

  @State() searchResults: {symbol: string, name: string}[] = [];
  @State() loading = false;

  @Event({bubbles: true, composed: true}) symbolSelected: EventEmitter<string>;
  async onFindStocks(event: Event) {
    event.preventDefault();
    this.loading = true;
    let stockName = this.stockNameInput.value;
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
      .then(res => res.json())
      .then(parsedRes => {
        this.searchResults = parsedRes['bestMatches'].map(match => {

          return {name: match['2. name'], symbol: match['1. symbol']};
        });
        this.loading = false;
      }).catch(err => {
        console.log(err);
        this.loading = false;
      });
  }

  onSelectSymbol(symbol: string) {
    this.symbolSelected.emit(symbol);
  }
  render() {
    let content = (<ul>{this.searchResults.map(result =>
      <li onClick={this.onSelectSymbol.bind(this, result.symbol)}>{result.name} ({result.symbol})</li>
    )}</ul>);

    if (this.loading) {
      content = <uc-spinner></uc-spinner>;
    }

    return [
      <form onSubmit={this.onFindStocks.bind(this)}>
        <input id="stock-symbol" ref={el => this.stockNameInput = el}/>
        <button type="submit">Find!</button>
      </form>,
      content
    ]
  }
}
