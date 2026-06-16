import {
  div,
  label,
  input,
  h3,
  p,
  ul,
  li,
  span,
  button,
} from "@borovlioff/no-jsx";
import {
  securityStore,
  type SecurityScheme,
} from "../../shared/state/security-schemes";
import {
  globalSecurityStore,
  type GlobalSecurityRequirement,
} from "../../shared/state/security";

export const createGlobalSecuritySelector = () => {
  return div(
    { className: "mt-6 pt-6 border-t border-gray-200" },
    h3(
      { className: "text-sm font-semibold text-gray-700 mb-3" },
      "Глобальная безопасность",
    ),
    p(
      { className: "text-xs text-gray-500 mb-4" },
      "Выберите схемы, которые будут применяться ко всем операциям API по умолчанию.",
    ),

    () => {
      const schemes = securityStore.get(); // Подписка на список схем
      const globalSec = globalSecurityStore.get(); // Подписка на текущий выбор

      if (schemes.length === 0) {
        return div(
          { className: "text-sm text-gray-400 italic" },
          "Сначала создайте хотя бы одну схему безопасности во вкладке 'Безопасность'.",
        );
      }

      return div(
        { className: "space-y-2" },
        ...schemes.map((scheme) => {
          // Проверяем, выбрана ли эта схема глобально
          const isSelected = globalSec.some((req) => req[scheme.name]);

          return div(
            {
              className: "flex items-center gap-3 p-2 rounded hover:bg-gray-50",
            },
            input({
              type: "checkbox",
              checked: isSelected,
              className:
                "w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300",
              onChange: (e: Event) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                let newGlobalSec = [...globalSec];

                if (isChecked) {
                  // Добавляем требование безопасности
                  // Для простых схем (apiKey, http) scopes пустые []
                  newGlobalSec.push({ [scheme.name]: [] });
                } else {
                  // Удаляем требование безопасности
                  newGlobalSec = newGlobalSec.filter(
                    (req) => !req[scheme.name],
                  );
                }

                globalSecurityStore.set(newGlobalSec);
              },
            }),
            label(
              {
                className:
                  "text-sm text-gray-700 select-none cursor-pointer flex-1",
              },
              span({ className: "font-medium" }, scheme.name),
              span(
                { className: "text-xs text-gray-400 ml-2" },
                `(${scheme.type})`,
              ),
            ),
          );
        }),
      );
    },
  );
};
