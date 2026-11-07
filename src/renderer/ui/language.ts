import { getLanguage, isLanguage, LANGUAGES, t, type Language } from '@shared/i18n'
import { el } from './rows'

export type ChangeLanguage = (language: Language) => Promise<void>

export function languageSelect(changeLanguage: ChangeLanguage): HTMLSelectElement {
  const select = el(
    'select',
    {
      className: 'ml-language',
      title: t('language'),
      ariaLabel: t('language'),
      onkeydown: (event) => event.stopPropagation()
    },
    ...Object.entries(LANGUAGES).map(([value, name]) => el('option', { value, textContent: name, lang: value }))
  )
  select.value = getLanguage()
  select.onchange = async () => {
    const next = select.value
    if (!isLanguage(next) || next === getLanguage()) return
    select.disabled = true
    try {
      await changeLanguage(next)
    } finally {
      select.value = getLanguage()
      select.disabled = false
    }
  }
  return select
}
