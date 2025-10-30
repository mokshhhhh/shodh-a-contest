import React, { useEffect, useMemo, useState } from 'react'
import ProblemCard from './components/ProblemCard.jsx'
import Editor from './components/Editor.jsx'
import Result from './components/Result.jsx'
import problemsData from './data/problems.js'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export default function App() {
  const [problems, setProblems] = useState([])
  const [activeProblemId, setActiveProblemId] = useState('problem1')
  const [codeByProblem, setCodeByProblem] = useState({})
  const [language, setLanguage] = useState('python')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setProblems(problemsData)
  }, [])

  const activeProblem = useMemo(
    () => problems.find(p => p.id === activeProblemId) || problems[0],
    [problems, activeProblemId]
  )

  useEffect(() => {
    if (!activeProblem) return
    if (!(activeProblem.id in codeByProblem)) {
      const starter = language === 'python' ? getPythonStarter(activeProblem.id) : getCppStarter(activeProblem.id)
      setCodeByProblem(prev => ({ ...prev, [activeProblem.id]: starter }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProblem?.id])

  function getPythonStarter(pid) {
    if (pid === 'problem1') return 'a,b=map(int,input().split())\nprint(a+b)\n'
    return 'n=int(input())\nfor i in range(1,n+1):\n    if i%15==0: print("FizzBuzz")\n    elif i%3==0: print("Fizz")\n    elif i%5==0: print("Buzz")\n    else: print(i)\n'
  }

  function getCppStarter(pid) {
    if (pid === 'problem1') return '#include <bits/stdc++.h>\nusing namespace std;int main(){ios::sync_with_stdio(false);cin.tie(nullptr);long long a,b; if(!(cin>>a>>b)) return 0; cout<<a+b<<"\n"; return 0;}\n'
    return '#include <bits/stdc++.h>\nusing namespace std;int main(){ios::sync_with_stdio(false);cin.tie(nullptr);int n; if(!(cin>>n)) return 0; for(int i=1;i<=n;i++){ if(i%15==0) cout<<"FizzBuzz\n"; else if(i%3==0) cout<<"Fizz\n"; else if(i%5==0) cout<<"Buzz\n"; else cout<<i<<"\n"; } return 0;}\n'
  }

  const code = codeByProblem[activeProblem?.id] || ''

  async function runCode(onTestIndex = 0) {
    if (!activeProblem) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${BACKEND_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, problemId: activeProblem.id, testIndex: onTestIndex })
      })
      const data = await res.json()
      setResult({ mode: 'run', data })
    } catch (e) {
      setResult({ mode: 'run', data: { error: 'Network error' } })
    } finally {
      setLoading(false)
    }
  }

  async function submitCode() {
    if (!activeProblem) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${BACKEND_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, problemId: activeProblem.id })
      })
      const data = await res.json()
      setResult({ mode: 'submit', data })
    } catch (e) {
      setResult({ mode: 'submit', data: { error: 'Network error' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shodha-a-contest</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Single contest · 2 problems</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="btn btn-secondary"
            value={language}
            onChange={(e) => {
              const lang = e.target.value
              setLanguage(lang)
              if (activeProblem && !(activeProblem.id in codeByProblem)) {
                const starter = lang === 'python' ? getPythonStarter(activeProblem.id) : getCppStarter(activeProblem.id)
                setCodeByProblem(prev => ({ ...prev, [activeProblem.id]: starter }))
              }
            }}
          >
            <option value="python">Python</option>
            <option value="cpp">C++ (GCC)</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setResult(null)}>Clear</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="space-y-3 lg:col-span-1">
          {problems.map(p => (
            <ProblemCard key={p.id} active={p.id === activeProblemId} problem={p} onClick={() => setActiveProblemId(p.id)} />
          ))}
        </aside>
        <main className="lg:col-span-2 space-y-4">
          {activeProblem && (
            <div className="card p-5 space-y-3">
              <h2 className="text-xl font-semibold">{activeProblem.name}</h2>
              <p className="text-sm leading-6">{activeProblem.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="card p-4">
                  <h3 className="font-semibold mb-2">Input</h3>
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{activeProblem.io_format.input}</pre>
                </div>
                <div className="card p-4">
                  <h3 className="font-semibold mb-2">Output</h3>
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{activeProblem.io_format.output}</pre>
                </div>
              </div>
            </div>
          )}

          <div className="card p-5 space-y-3">
            <Editor
              value={code}
              onChange={(val) => setCodeByProblem(prev => ({ ...prev, [activeProblem.id]: val }))}
            />
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => runCode(0)} disabled={loading}>Run Code</button>
              <button className="btn btn-secondary" onClick={submitCode} disabled={loading}>Submit</button>
            </div>
          </div>

          <Result result={result} />
        </main>
      </div>
    </div>
  )
}




