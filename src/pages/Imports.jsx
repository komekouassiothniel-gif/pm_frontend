import { useState } from 'react'
import { uploadFichierSBC } from '../api/imports'

export default function Imports() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleUploadSites = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage("Veuillez sélectionner un fichier avant de lancer l'import.")
      setIsError(true)
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      setMessage(null)
      setIsError(false)

      const { data } = await uploadFichierSBC(file)

      setMessage(`Importation réussie ! ${data.nb_integres ?? 0} passage(s) intégré(s).`)
      setIsError(false)
      setFile(null)
    } catch (error) {
      console.error("Erreur d'importation :", error)
      setIsError(true)
      if (error.response) {
        setMessage(error.response.data?.detail || 'Erreur serveur')
      } else if (error.code === 'ECONNABORTED') {
        setMessage("Délai dépassé — vérifiez que l'API tourne")
      } else {
        setMessage('Erreur de connexion')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Console d'Importation</h1>
          <p className="text-sm text-slate-400">Téléversez un rapport SBC/PPM au format Excel.</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-lg font-medium text-slate-200">Liste Globale des Sites MTN</h3>

          <form onSubmit={handleUploadSites} className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-6 bg-slate-950 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                disabled={uploading}
              />
              <div className="text-center space-y-2">
                <span className="text-2xl">📊</span>
                <p className="text-sm text-slate-300">
                  {file ? `Fichier prêt : ${file.name}` : "Cliquez ou glissez-deposez le fichier MTN SITES"}
                </p>
                <p className="text-xs text-slate-500">Formats acceptés : .xlsx, .xls</p>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm border font-medium ${
                isError
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                uploading || !file
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {uploading ? "Analyse de la base MTN en cours..." : "Lancer l'importation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
