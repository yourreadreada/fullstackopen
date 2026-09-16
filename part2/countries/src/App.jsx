import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryDetail from './components/CountryDetail'

const App = () => {
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    setSelectedCountry(null)
  }

  const filtered = query
    ? countries.filter(c =>
        c.name.common.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div>
      <div>
        find countries <input value={query} onChange={handleQueryChange} />
      </div>

      {selectedCountry ? (
        <CountryDetail country={selectedCountry} />
      ) : filtered.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : filtered.length > 1 ? (
        <div>
          {filtered.map(c => (
            <div key={c.cca3}>
              {c.name.common}{' '}
              <button onClick={() => setSelectedCountry(c)}>show</button>
            </div>
          ))}
        </div>
      ) : filtered.length === 1 ? (
        <CountryDetail country={filtered[0]} />
      ) : null}
    </div>
  )
}

export default App
